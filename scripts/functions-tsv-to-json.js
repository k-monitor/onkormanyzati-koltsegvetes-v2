import fs from 'fs';

const csv = fs.readFileSync('./src/data/functions.tsv', 'utf8');
const json = {};
csv.split('\n')
	.map((line) => line.split('\t'))
	.filter((cells) => cells.length >= 2)
	.forEach((cells) => {
		const id = cells[0];
		const name = cells[1];
		json[id] = name;
	});

fs.writeFileSync('./src/data/functions.json', JSON.stringify(json));
