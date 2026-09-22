import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
// Written to the public dir (not src/data) so it is served as a static asset and
// lazy-loaded at runtime instead of bundled into the JS. The milestones dataset can be
// tens of MB; bundling it can OOM `nuxt generate` and bloat the client chunk.
// It is split so the client never has to download everything at once:
// - index.json: rels, per-year counts/file names and the positioned (map) milestones
// - <n>.json: all milestones of one year, fetched when that year is viewed/searched
const OUTPUT_DIR = './static/data/milestones';
const LEGACY_OUTPUT_FILE = './static/data/milestones.json';

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

	const byYear = {};
	const positioned = {};
	Object.entries(output.milestones).forEach(([id, m]) => {
		(byYear[m.year] ||= {})[id] = m;
		if (m.position) positioned[id] = m;
	});

	const index = { rels: output.rels, years: {}, positioned };
	fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
	fs.rmSync(LEGACY_OUTPUT_FILE, { force: true });
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	Object.entries(byYear).forEach(([year, milestones], i) => {
		const file = i + '.json';
		index.years[year] = { file, count: Object.keys(milestones).length };
		fs.writeFileSync(path.join(OUTPUT_DIR, file), JSON.stringify(milestones));
	});
	fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index));
};
