const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/tooltips.xlsx';
const OUTPUT_FILE = './src/data/tooltips.json';

const workbook = xlsx.readFile(INPUT_FILE);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const tsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

const output = {};

tsv.split('\n').forEach(row => {
	let [id, tooltip] = row.split('\t');
	if (id && tooltip && id.match(/[BK]?\d+/)) {
		id = id.trim();
		output[id] = tooltip.trim();
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
