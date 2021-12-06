const fs = require('fs');
const slugify = require('slugify');

const config = JSON.parse(fs.readFileSync('src/data/config.json', { encoding: 'utf8' }));
const data = JSON.parse(fs.readFileSync('src/data/data.json', { encoding: 'utf8' }));

const { defaultYear, theme } = config; // theme: { year: color, ... }
const defaultColor = theme[defaultYear] || '#0d6efd'; // fallback to BS $primary
const years = Object.keys(data);

const mapEntries = years.map(y => {
	const slugifiedYear = slugify(y);
	const color = theme[y] || defaultColor;
	return `"${slugifiedYear}":${color}`
}).join(',\n');

const map = `$year-colors:(\n${mapEntries}\n);`;
const $primary = theme[defaultYear] ? `$primary: ${defaultColor};` : '';

fs.writeFileSync('src/scss/_generated.scss', `${map}\n${$primary}`);
