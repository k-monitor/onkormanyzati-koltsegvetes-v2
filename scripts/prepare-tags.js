const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/tags.xlsx';
const OUTPUT_FILE = './src/data/tags.json';

const workbook = xlsx.readFile(INPUT_FILE);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const tsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

const output = {
	"expense": {
		"econ": {},
		"func": {}
	},
	"income": {
		"econ": {},
		"func": {}
	}
};

tsv.split('\n').forEach(row => {
	let [side, type, id, tags] = row.split('\t');
	if (output[side] && output[side][type]) { // checking validity - needs predefined output skeleton
		id = id.split(' ')[0];
		tags = tags.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0);

		const uniqueTags = {};
		tags.forEach(tag => {
			uniqueTags[tag] = true;
		});

		Object.keys(uniqueTags).forEach(longer => {
			Object.keys(uniqueTags).forEach(shorter => {
				if (longer != shorter && longer.includes(shorter)) {
					delete uniqueTags[shorter];
				}
			});
		});

		output[side][type][id] = Object.keys(uniqueTags).sort();
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
