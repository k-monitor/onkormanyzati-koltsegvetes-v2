const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/tooltips.json';

const workbook = xlsx.readFile(INPUT_FILE);

const output = {};

workbook.SheetNames.filter(name => name.startsWith('tooltips ')).forEach(tooltipSheetName => {
	const p = tooltipSheetName.split(' ');
	p.shift();
	const year = p.join(' ');
	output[year] = output[year] || {};

	const tsv = xlsx.utils.sheet_to_csv(workbook.Sheets[tooltipSheetName], { FS: '\t' });

	tsv.split('\n').forEach((row, i) => {
		if (i === 0) return;
		let [id, _, tooltip] = row.split('\t');
		if (tooltip === '#N/A') tooltip = false;
		if (id && tooltip) {
			output[year][id] = tooltip.trim();
		}
	});
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
