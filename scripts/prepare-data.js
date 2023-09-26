const fs = require('fs');
const fg = require('fast-glob');
const rmrf = require('rimraf').sync;
const xlsx = require('xlsx');

const INPUT_FILE = './input/budget.xlsx';
const INTERMEDIARY_JSON_GLOB = './src/data/2*/*.json';
// main script

(() => {
	console.log(`Processing file: ${INPUT_FILE}`);
	const workbook = xlsx.readFile(INPUT_FILE);
	const funcTreeTsv = fs.readFileSync('./src/data/functions.tsv', 'utf-8');

	// cleanup
	fg.sync(INTERMEDIARY_JSON_GLOB).forEach(f => {
		fs.unlinkSync(f);
	});
	fs.readdirSync('./src/data').forEach(d => {
		const fd = './src/data/' + d;
		if (d.match(/^2\d+$/) && fs.readdirSync(fd).length == 0) {
			rmrf(fd);
		}
	});

	const data = {};

	workbook.SheetNames.forEach(sheetName => {
		console.log(`Reading sheet: ${sheetName}`);
		const matrixTsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

		const parsedSheetName = parseSheetName(sheetName);
		if (parsedSheetName) {
			const { year, side } = parsedSheetName;

			data[year] = data[year] || {};
			data[year][side] = data[year][side] || {};

			console.log('Generating economic tree');
			data[year][side]['econ'] = generateEconomicTree(matrixTsv);

			console.log('Generating functional tree');
			data[year][side]['func'] = generateFunctionalTree(matrixTsv, funcTreeTsv);
		} else {
			console.log('Invalid sheet name!');
		}
	});

	const OUTPUT_FILE = './src/data/data.json';
	writeToFile(JSON.stringify(data), OUTPUT_FILE);
})();

// lib

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @returns {string} Economical tree
 */
function generateEconomicTree(matrixTsv) {
	const nodes = {};

	// collecting all nodes

	matrixTsv.split('\n')
		.splice(2) // header is at least 2 rows
		.filter(row => row.match(/^\d{2,}/)) // we need rows that start with valid economic category ID
		.forEach((row, i) => {
			let [_, descriptor, value] = row.split('\t'); // we need only the 2nd and 3rd column
			let { id, name } = parseEconomicDescriptor(descriptor);
			value = Number((value || '').replace(/[^0-9\-]+/g, ''));
			if (id && id.indexOf('-') == -1) {
				if (name.startsWith("ebből:") || nodes[id]) {
					id = `${id}:${i}`;
				}
				nodes[id] = {
					id,
					name,
					value
				};
			}
		});

	// transforming into tree / handling "ebből:" rows
	Object.keys(nodes).filter(id => id.includes(':')).forEach(id => {
		const parentId = id.split(':')[0];
		if (nodes[parentId]) {
			nodes[parentId].children = nodes[parentId].children || [];
			nodes[parentId].children.push(nodes[id]);
		}
		delete nodes[id];
	});

	// transforming into tree / connecting parents with children
	const sortedIds = Object.keys(nodes).sort();
	const deletableIds = [];
	for (let i = 0; i < sortedIds.length; i++) {
		const id = sortedIds[i];
		if (id.length == 2 || id.startsWith('F')) continue; // root nodes, incl. FH1, FH2, FT1, FT2
		let j = i - 1;
		for (; j >= 0 && sortedIds[j].length >= id.length; j--);
		if (j > -1) { // found parent
			const parentId = sortedIds[j];
			nodes[parentId].children = nodes[parentId].children || [];
			nodes[parentId].children.push(nodes[id]);
			deletableIds.push(id);
		}
	}

	// cleanup
	Object.keys(nodes)
		.filter(id => deletableIds.includes(id))
		.forEach(id => delete nodes[id]);


	// we dropped out total sum line (via id filter) so we calculate it
	const children = Object.values(nodes);
	const value = children
		.filter(n => !n.id.startsWith('F')) // skipping FH1, FH2, FT1, FT2
		.map(n => n.value)
		.reduce((sum, v) => sum + v, 0);
	const root = {
		name: 'Összesen',
		children,
		value
	};

	return root;
}

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @param {string} funcTreeTsv Functional tree descriptor in TSV string
 * @returns {string} Functional tree (if available in the matrix)
 */
function generateFunctionalTree(matrixTsv, funcTreeTsv) {
	const nodes = parseFunctionalTreeDescriptor(funcTreeTsv);

	const rows = matrixTsv.split('\n');
	const header = rows[1].split('\t').map(col => Number(col.trim().split(' ')[0]));
	if (header.length > 3) {

		// finding the total row
		let max = 0, maxRow = '';
		rows.forEach(row => {
			const sum = Number((row.split('\t')[2] || '0').replace(/\D+/g, ''));
			if (sum > max) {
				max = sum;
				maxRow = row;
			}
		});

		// collecting total values for nodes
		maxRow.split('\t').forEach((col, i) => {
			if (i > 2 && i < header.length) {
				const id = header[i];
				if (!id) return;
				if (!nodes[id]) {
					console.log('[KÖKÖ]', 'Budget-ben szereplő ID hiányzik a funkcionális fából:', id);
					return;
				}
				nodes[id].value = Number(col.replace(/\D+/g, ''));
			}
		});

		// transforming into tree
		Object.values(nodes).forEach(node => {
			if (node.parent) {
				if (nodes[node.parent]) {
					nodes[node.parent].children = (nodes[node.parent].children || []).concat(node);
					node.deletable = true;
				} else {
					console.log(`Parent node not found: ${node.parent}`);
				}
			}
		});
		Object.values(nodes)
			.filter(node => node.deletable)
			.forEach(node => delete nodes[node.id]);
		const root = {
			name: 'Összesen',
			children: Object.values(nodes)
		};

		// calculating sums
		function sumNode(node) {
			if (node.children) {
				node.value = node.children
					//.map(n => sumNode(n)) // turning off recursive step, so we only sum for the root node, lower node values come from budget
					.reduce((sum, node) => sum + (node.value || 0), 0);
			}
			return node;
		}
		sumNode(root);

		// cleaning up
		function cleanUp(node) {
			delete node.deletable;
			if (node.children) {
				node.children = node.children.filter(n => n.value && n.value > 0);
				node.children.forEach(cleanUp);
			}
		}
		cleanUp(root);

		if (root.value > 0) return root;
	}

	console.log('No functional data found.');
	return null;
}

/**
 * @param {string} descriptor Economical category descriptor (2nd column in matrix)
 * @returns {{id: string, name: string}} Components of category descriptor
 */
function parseEconomicDescriptor(descriptor) {
	let id, m;

	if ((m = descriptor.match(/ \(((B|K|FH|FT)[0-9\-]+)\)/))) {
		id = m[1];
	}

	let name = descriptor.replace(`(${id})`, '');
	if ((m = descriptor.match(/[^§]{10} \(?\(?([>=]*[0-9+….]+)\)/))) {
		name = name.replace(m[1], '');
	}
	name = name.replace(/\(\)+ *$/, '').replace(/\(+$/, '').trim();

	return { id, name };
}

/**
 * @param {string} tsv Functional tree descriptor TSV string
 * @returns Functional tree nodes having `{id, name, parent}` inside an object where key is the `id`
 */
function parseFunctionalTreeDescriptor(tsv) {
	const nodes = {};
	tsv.split('\n').forEach(row => {
		if (!row.trim().length) return;
		let [id, name, parent] = row.split('\t');
		id = Number(id);
		parent = Number('0' + parent.replace(/\D+/g, ''));
		parent = parent > 0 ? parent : null;
		nodes[id] = { id, name, parent };
	});
	return nodes;
}

/**
 * @param {string} sheetName Worksheet name
 * @return {{year: string, side: string}} Year and side where side can be one of 'income' or 'expense'
 */
function parseSheetName(sheetName) {
	/*
		2020_kiadas
		2020 KIADÁS
		2020 MÓDOSÍTOTT BEVÉTEL
	*/
	sheetName = sheetName.replace(/BEV[EÉ]TEL$/i, 'income').replace(/KIAD[AÁ]S$/i, 'expense');

	const sideMatch = sheetName.match(/[ _](income|expense)$/);
	if (!sideMatch) return null;

	const side = sideMatch[1];
	const year = sheetName.substring(0, sideMatch.index)
	return { year, side }
}

/**
 * Writes content to file if the content is actually containing anything.
 *
 * @param {string} content Content to be written into file
 * @param {string} filename Output filename
 */
function writeToFile(content, filename) {
	if (content && content.length > 0) {
		console.log(`Writing file (${Math.round(content.length / 102.4) / 10} KB): ${filename}`);
		fs.writeFileSync(filename, content);
	}
}
