const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/milestones.xlsx';
const OUTPUT_FILE = './src/data/milestones.json';

const workbook = xlsx.readFile(INPUT_FILE);


function getSheetAsTsv(workbook, index) {
	const sheetName = workbook.SheetNames[index];
	const sheet = workbook.Sheets[sheetName];
	return tsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });
}

const output = {
	milestones: {},
	rels: {}
};

getSheetAsTsv(workbook, 0).split('\n').forEach(row => {
	let [id, year, picture, title, description] = row.split('\t');
	if (id && year && picture && title && description && year.match(/\d{4}/)) {
		id = id.trim();
		picture = picture.trim();
		output.milestones[id] = { year, picture, title, description };
	}
});

getSheetAsTsv(workbook, 1).split('\n').forEach(row => {
	let [side, type, catId, milestoneId] = row.split('\t');
	if (side && type && catId && milestoneId && catId.match(/[BK]?\d+( .*)?/)) {
		catId = catId.split(' ')[0];
		const milestone =output.milestones[milestoneId];
		if (milestone) {
			year = milestone.year;
			if (!output.rels[year]) {
				output.rels[year] = {
					"expense": {
						"econ": {},
						"func": {}
					},
					"income": {
						"econ": {},
						"func": {}
					}
				}
			}
			output.rels[year][side][type][catId] = milestoneId; // one milestone per category per year
		}
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
