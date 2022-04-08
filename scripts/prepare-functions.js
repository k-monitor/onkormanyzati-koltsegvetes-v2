const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/functions.tsv';

const workbook = xlsx.readFile(INPUT_FILE);
const json = xlsx.utils.sheet_to_json(workbook.Sheets['functions']);

let tsv = '';
if (json.length) {
	json.forEach(row => {
		tsv += `${row.id}\t${row.name}\t${row.parent.trim()}\n`
	});
} else { // for older configs, use defaults
	tsv = fs.readFileSync('./scripts/default-functions.tsv', { encoding: 'utf8' });
}

fs.writeFileSync(OUTPUT_FILE, tsv);
