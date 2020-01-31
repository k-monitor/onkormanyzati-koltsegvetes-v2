const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/tooltips.json';

const workbook = xlsx.readFile(INPUT_FILE);
const tsv = xlsx.utils.sheet_to_csv(workbook.Sheets['tooltips'], { FS: '\t' });

const output = {};

tsv.split('\n').forEach((row, i) => {
	if (i === 0) return;
	let [id, _, tooltip] = row.split('\t');
	if (id && tooltip) {
		output[id] = tooltip.trim();
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
