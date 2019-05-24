const fs = require('fs');
const mkdirp = require('mkdirp').sync;
const xlsx = require('xlsx');

// configruation

if (process.argv.length < 3) {
	console.log('\nKérlek add meg az input fájl útvonalát! Példa:\n');
	console.log('\t node scripts/prepare-data data/src/input_fajl.xslx\n');
	return;
}

const INPUT_FILE = process.argv[2];

// main script

(() => {
	console.log(`Processing file: ${INPUT_FILE}`);
	const workbook = xlsx.readFile(INPUT_FILE);
	const funcTreeTsv = fs.readFileSync('data/functions.tsv', 'utf-8');

	workbook.SheetNames.forEach(sheetName => {
		console.log(`Reading sheet: ${sheetName}`);
		const matrixTsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

		if (isSheetNameValid(sheetName)) {
			const { dir, econFile, funcFile } = generateFilenames(sheetName);
			mkdirp(dir);

			console.log('Generating economic tree');
			writeToFile(generateEconomicTree(matrixTsv), econFile);

			console.log('Generating functional tree');
			writeToFile(generateFunctionalTree(matrixTsv, funcTreeTsv), funcFile);

		} else {
			console.log('Invalid sheet name!');
		}
	});
})();

// lib

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @returns {string} Economical tree
 */
function generateEconomicTree(matrixTsv) {
	const nodes = {};

	// collecting all nodes
	matrixTsv.split('FINANSZÍROZÁSI')[0].split('\n')
		.splice(2) // header is at least 2 rows
		.filter(row => row.match(/^\d{2,}/)) // we need rows that start with valid economic category ID
		.forEach(row => {
			let [id, descriptor, value] = row.split('\t'); // we need only these 3 columns
			id = Number(id);
			value = Number(value.replace(/\D+/g, ''));
			const { name, childrenIds, altId } = parseEconomicDescriptor(descriptor);
			if (altId && altId.indexOf('-') == -1) {
				nodes[id] = { id, altId, name, childrenIds, value };
			}
		});

	// filling relations
	Object.values(nodes).forEach(node => {
		if (node.childrenIds) {
			node.children = [];
			node.childrenIds.forEach(cid => {
				if (nodes[cid]) {
					nodes[cid].parent = node.id;
					node.children.push(nodes[cid]);
				}
			});
			delete node.childrenIds;
		}
	});

	// we dropped out total sum line (via altId filter) so we calculate it
	const children = Object.values(nodes).filter(node => !node.parent);
	const value = children.map(n => n.value).reduce((sum, v) => sum + v);
	const root = {
		name: 'Összesen',
		children,
		value
	};
	return JSON.stringify(root);
}

/**
 * @param {string} sheetName Worksheet name
 * @returns {{dir: string, econFile: string, funcFile: string}} Directory name and filenames for economical and functional trees, based on worksheet name
 */
function generateFilenames(sheetName) {
	let [year, name] = sheetName.split(' ');
	name = name.replace('BEVÉTEL', 'income').replace('KIADÁS', 'expense');
	const dir = `data/${year}`;
	const econFile = `${dir}/${name}-econ.json`;
	const funcFile = `${dir}/${name}-func.json`;
	return { dir, econFile, funcFile };
}

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @param {string} funcTreeTsv Functional tree descriptor in TSV string
 * @returns {string} Functional tree (if available in the matrix)
 */
function generateFunctionalTree(matrixTsv, funcTreeTsv) {
	const nodes = parseFunctionalTreeDescriptor(funcTreeTsv);

	const rows = matrixTsv.split('\n');
	const header = rows[1].split('\t').map(col => Number(col.split(' ')[0]));
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
			if (i > 2) {
				const id = header[i];
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

		function sumNode(node) {
			if (node.children) {
				node.value = node.children
					.map(n => sumNode(n))
					.reduce((sum, node) => sum + (node.value || 0), 0);
			}
			return node;
		}
		sumNode(root);

		function cleanUp(node) {
			delete node.deletable;
			if (node.children) {
				node.children = node.children.filter(n => n.value && n.value > 0);
				node.children.forEach(cleanUp);
			}
		}
		cleanUp(root);

		return JSON.stringify(root);
	} else {
		console.log('No functional data found.');
		return null;
	}
}

/**
 * @param {string} sheetName Worksheet name
 * @returns {boolean} Whether the sheet name is valid for processing
 */
function isSheetNameValid(sheetName) {
	return sheetName.match(/^\d{4} (BEVÉTEL|KIADÁS)$/);
}

/**
 * @param {string} descriptor Economical category descriptor (2nd column in matrix)
 * @returns {{altId: string, childrenIds: number[], name: string}} Components of category descriptor
 */
function parseEconomicDescriptor(descriptor) {
	let altId, childrenIds, name, m;

	if ((m = descriptor.match(/ \(([BK0-9\-]+)\)$/))) {
		altId = m[1];
	}

	if ((m = descriptor.match(/ \([>=]*([0-9+….]+)\) /))) {
		childrenIds = parseFormula(m[1]);
	}

	name = descriptor.replace(/ +\([>=+….\) \(BK0-9\-]+\)$/, '');

	return { altId, childrenIds, name };
}

/**
 * @param {string} f Formula like `01+…+04+21`
 * @returns {number[]} All the numbers referenced in the formula, e.g. `[1,2,3,4,21]`
 */
function parseFormula(f) {
	const ids = [];
	f.replace(/\+[….]+\+/, ':').split('\+').forEach(el => {
		if (el.match(/^\d+$/g)) {
			ids.push(Number(el));
		} else if (el.indexOf(':') > -1) {
			const bounds = el.split(':').map(b => b.match(/^\d+$/) ? Number(b) : 0);
			for (let i = bounds[0]; i <= bounds[1]; i++) ids.push(i);
		}
	});
	return ids;
}

/**
 * @param {string} tsv Functional tree descriptor TSV string
 * @returns Functional tree nodes having `{id, name, parent}` inside an object where key is the `id`
 */
function parseFunctionalTreeDescriptor(tsv) {
	const nodes = {};
	tsv.split('\n').forEach(row => {
		let [id, name, parent] = row.split('\t');
		id = Number(id);
		parent = Number('0' + parent.replace(/\D+/g, ''));
		parent = parent > 0 ? parent : null;
		nodes[id] = { id, name, parent };
	});
	return nodes;
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
