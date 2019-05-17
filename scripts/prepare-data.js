const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const xlsx = require('xlsx');

// configruation

//if(process.argv.length < 3) {
//	console.log('\nKérlek add meg az input fájl útvonalát! Példa:\n');
//	console.log('\t node scripts/prepare-data data/src/input_fajl.xslx\n');
//	return;
//}

const INPUT_FILE = //process.argv[2];
	'data/src/tápió adatok.xlsx';

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
			console.log('  - Invalid sheet name!');
		}
	});
})();

// lib

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @returns {string} Economical tree
 */
function generateEconomicTree(matrixTsv, ) {
	const nodes = {};
	matrixTsv.split('\n')
		.splice(2) // header is at least 2 rows
		.filter(row => row.match(/^\d{2,}/)) // we need rows that start with valid economic category ID
		.forEach(row => {
			let [id, descriptor, value] = row.split('\t'); // we need only these 3 columns
			id = Number(id);
			value = Number(value.replace(/\D+/g, ''));
			const { name, childrenIds, altId } = parseEconomicDescriptor(descriptor);
			nodes[id] = { id, altId, name, childrenIds };
		});
	console.log(nodes);
	/*
		- header kuka és csak az első 3 oszlop kell
		- kiparszoljuk a sorokból a [ id, name, value, child_ids ] objektumokat
		- végigmegyünk rajtuk, és a child_ids alapján összerakjuk a fát
	*/
}

/**
 * @param {string} sheetName Worksheet name
 * @returns {{dir: string, econFile: string, funcFile: string}} Directory name and filenames for economical and functional trees, based on worksheet name
 */
function generateFilenames(sheetName) {
	let [year, name] = sheetName.split(' ');
	name = name.replace('BEVÉTEL', 'income').replace('KIADÁS', 'expense');
	const dir = `data/${year}`;
	const econFile = `${dir}/${name}-econ.tsv`
	const funcFile = `${dir}/${name}-func.tsv`
	return { dir, econFile, funcFile };
}

/**
 * @param {string} matrixTsv Input matrix in TSV string
 * @param {string} funcTreeTsv Functional tree descriptor in TSV string
 * @returns {string} Functional tree (if available in the matrix)
 */
function generateFunctionalTree(matrixTsv, funcTreeTsv) {
	/*
		- töröljük a tényleges subtotal sorokat! (amiben ">=" van, azt nem) és aztán az első 3 oszlopot
		- oszloponként összegezzük a maradékot, így [id, value] objektumokat kapunk
		- betöltjük a funkcionális fa definíciót
		- az alapján felépítjük a fát
		- rekurzívan összegzünk
	*/
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

	name = descriptor.replace(/\([>=+….\) \(BK0-9\-]+\)$/, '');

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
 * Writes content to file if the content is actually containing anything.
 *
 * @param {string} content Content to be written into file
 * @param {string} filename Output filename
 */
function writeToFile(content, filename) {
	if (content && content.length > 0) {
		console.log(`Writing file (~${Math.round(content.length / 1024)} KB): ${filename}`);
		fs.writeFileSync(filename, content);
	}
}

// olds

function convertBudget(tsv, outputFile) {
	mkdirp(path.dirname(outputFile));
	const outputLines = [];

	let funcIds;
	const rows = tsv.split('\n').splice(1); // remove first row
	rows.forEach((row, i) => {
		const cols = row.split('\t');
		if (i == 0) {
			funcIds = cols.map(s => s.split(' ')[0]);
			funcIds[2] = '+';
		} else if (cols[0].trim().match(/^\d{2,}$/)) { // valid econ ID
			const econId = cols[0];
			const econDesc = cols[1];
			if (econDesc.indexOf('=') == -1) {
				for (let j = 2; j < cols.length; j++) {
					const value = Number(cols[j].replace(/\D+/g, ''));
					if (value > 0) {
						const outputLine = [
							econId,
							funcIds[j],
							value
						].join('\t');
						outputLines.push(outputLine);
					}
				}
			}
		}
	});

	fs.writeFileSync(outputFile, outputLines.join('\n'));
}

function generateTree(tsv, outputFile) {
	const rows = tsv.split('\n').splice(2); // remove first 2 rows
	const nodes = {};
	rows.forEach(row => {
		const cols = row.split('\t');
		if (cols[0].trim().match(/^\d{2,}$/)) { // valid econ ID
			const id = cols[0];
			const name = cols[1]
				.replace(/ \([BK0-9\-]+\)/g, '') // remove alt. ID
				.replace(/ \([=>0-9+….]+\)/, '') // remove equation
				.trim();
			const formulaMatch = cols[1].match(/ \([=>]*([0-9+….]+)\)/);
			const formula = formulaMatch ? formulaMatch[1] : '';
			const children = parseFormula(formula);
			nodes[Number(id)] = {
				id,
				name,
				children
			};
		}
	});
	Object.values(nodes).forEach(parent => {
		parent.children.forEach(childId => {
			if (nodes[childId]) {
				nodes[childId].parent = parent.id;
			}
		});
	});

	const outputLines = [];
	Object.values(nodes).forEach(node => {
		const outputLine = [
			node.id,
			node.name,
			node.parent || 0
		].join('\t');
		outputLines.push(outputLine);
	});
	fs.writeFileSync(outputFile, outputLines.join('\n'));
}

