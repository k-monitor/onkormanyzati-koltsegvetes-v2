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
	let { nodeId, year, imageFile, videoFile, title, descriptionInMarkdown, tags } = row;
	const nodeIds = (nodeId || '').split(',').map(id => id.trim()).filter(id => id.length);
	if (year && String(year).match(/\d{4}/) && title && descriptionInMarkdown) {
		output.milestones[id] = {
			year,
			picture: 'assets/ms/' + (imageFile || 'fejlesztesek-01.svg'),
			overlay: imageFile ? false : true,
			title,
			description: descriptionInMarkdown,
			vid: videoFile ? 'assets/ms/' + videoFile : null,
			tags: (tags || '').split(',').map(t => t.trim()).filter(t => t.length),
			nodeIds,
		};
		output.rels[year] = output.rels[year] || {};
		nodeIds.forEach(nodeId => {
			output.rels[year][nodeId] = id;
		});
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
