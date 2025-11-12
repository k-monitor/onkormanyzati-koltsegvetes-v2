import fs from 'fs';

const csv = fs.readFileSync('./src/data/tags.csv', 'utf8');
const json = {};
csv.split('\n')
	.map((line) => line.split(';'))
	.filter((cells) => cells.length == 2)
	.forEach((cells) => {
		const id = cells[0].split(' ')[0];
		const tags = cells[1]
			.toLowerCase()
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		const uniqueTags = {};
		tags.forEach((tag) => {
			uniqueTags[tag] = true;
		});

		Object.keys(uniqueTags).forEach((longer) => {
			Object.keys(uniqueTags).forEach((shorter) => {
				if (longer != shorter && longer.includes(shorter)) {
					delete uniqueTags[shorter];
				}
			});
		});

		json[id] = Object.keys(uniqueTags).sort();
	});

fs.writeFileSync('./src/data/tags.json', JSON.stringify(json));
