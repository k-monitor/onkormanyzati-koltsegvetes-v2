const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/texts-template.xlsx'; // TODO should be texts.xlsx in the end
const OUTPUT_FILE = './src/data/config.json';

const workbook = xlsx.readFile(INPUT_FILE);
const sheetName = workbook.SheetNames[0];
const tsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

let configJson = {};
tsv.split('\n').forEach((row, i) => {
	if (i === 0) return;
	row = row.split('\t');
	if (row.length < 3) return;
	console.log(row);
	const keyParts = row[0].split('\.');
	const group = keyParts[0];
	const key = keyParts[1];
	configJson[group] = configJson[group] || {};
	configJson[group][key] = row[2];
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(configJson));
