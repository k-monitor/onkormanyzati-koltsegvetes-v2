import fs from 'fs';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/milestones.json';

export default () => {
	const workbook = xlsx.readFile(INPUT_FILE);
	const json = xlsx.utils.sheet_to_json(workbook.Sheets['milestones']);

	const output = {
		milestones: {},
		rels: {},
	};

	json.forEach((row, id) => {
		id = 'M' + id;
		const {
			nodeId,
			year,
			imageFile,
			videoFile,
			title,
			descriptionInMarkdown,
			tags,
			pos,
			onlyOnMap,
		} = row;
		const nodeIds = (nodeId || '')
			.split(',')
			.map((id) => id.trim())
			.filter((id) => id.length);

		// Parse position (lat,long) from pos field
		let position = null;
		if (pos && typeof pos === 'string') {
			const coords = pos.split(',').map((c) => parseFloat(c.trim()));
			if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
				position = { lat: coords[0], lng: coords[1] };
			}
		}

		if (year && String(year).match(/\d{4}/) && title && descriptionInMarkdown) {
			output.milestones[id] = {
				year,
				picture: 'assets/ms/' + (imageFile || 'fejlesztesek-01.svg'),
				overlay: imageFile ? false : true,
				title,
				description: descriptionInMarkdown,
				vid: videoFile ? 'assets/ms/' + videoFile : null,
				tags: (tags || '')
					.split(',')
					.map((t) => t.trim())
					.filter((t) => t.length),
				nodeIds,
				position,
				onlyOnMap: onlyOnMap == '1',
			};
			output.rels[year] = output.rels[year] || {};
			nodeIds.forEach((nodeId) => {
				output.rels[year][nodeId] = id;
			});
		}
	});

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
};
