const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/milestones.json';

const workbook = xlsx.readFile(INPUT_FILE);
const json = xlsx.utils.sheet_to_json(workbook.Sheets['milestones']);

const output = {
	milestones: {},
	rels: {}
};

json.forEach((row, id) => {
	id = 'M' + id;
	let { nodeId, year, imageFile, videoFile, title, descriptionInMarkdown } = row;
	if (year && String(year).match(/\d{4}/) && title && descriptionInMarkdown) {
		output.milestones[id] = {
			year,
			picture: imageFile,
			title,
			description: descriptionInMarkdown,
			vid: videoFile
		};
		output.rels[year] = output.rels[year] || {};
		if (nodeId) {
			output.rels[year][nodeId] = id;
		}
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
