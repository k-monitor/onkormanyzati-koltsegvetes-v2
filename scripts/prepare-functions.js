import fs from 'fs';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/functions.tsv';

const workbook = xlsx.readFile(INPUT_FILE);
const json = xlsx.utils.sheet_to_json(workbook.Sheets['functions']);

let tsv = '';
if (json.length) {
	json.forEach((row) => {
		const id = Number(row.id);
		const parent = Number(row.parent);
		tsv += `${id}\t${row.name}\t${parent}\n`;
	});
} else {
	// for older configs, use defaults
	tsv = fs.readFileSync('./scripts/default-functions.tsv', { encoding: 'utf8' });
}

fs.writeFileSync(OUTPUT_FILE, tsv);
