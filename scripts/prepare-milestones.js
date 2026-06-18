import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
// Written to the public dir (not src/data) so it is served as a static asset and
// lazy-loaded at runtime instead of bundled into the JS. The milestones dataset can be
// tens of MB; bundling it can OOM `nuxt generate` and bloat the client chunk.
const OUTPUT_FILE = './static/data/milestones.json';

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
		const nodeIds = String(nodeId || '')
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

	fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
};
