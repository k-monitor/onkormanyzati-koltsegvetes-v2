const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const xlsx = require('xlsx');

// configruation

if(process.argv.length < 3) {
	console.log('\nKérlek add meg az input fájl útvonalát! Példa:\n');
	console.log('\t node scripts/prepare-data data/src/input_fajl.xslx\n');
	return;
}

const INPUT_FILE = process.argv[2];

// main script

(() => {
	console.log(`Processing file: ${INPUT_FILE}`);
	const workbook = xlsx.readFile(INPUT_FILE);

	workbook.SheetNames.forEach(sheet => {
		console.log(`Processing sheet: ${sheet}`);
		const sheetTsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheet], { FS: '\t' });

		const year = sheet.split(' ')[0];
		const name = sheet.split(' ')[1]
			.replace('BEVÉTEL', 'income')
			.replace('KIADÁS', 'expense');

		const matrixFile = `data/${year}/${name}.tsv`;
		console.log(`\tGenerating matrix -> ${matrixFile}`);
		convertBudget(sheetTsv, matrixFile);

		const treeFile = `data/${year}/${name}-tree.tsv`;
		console.log(`\tGenerating tree -> ${treeFile}`);
		generateTree(sheetTsv, treeFile);
	});
})();

// lib

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
			const formulaMatch = cols[1].match(/ \(\D*([0-9+….]+)\)/);
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
