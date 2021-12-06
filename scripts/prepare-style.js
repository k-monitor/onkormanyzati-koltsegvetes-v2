const fs = require('fs');
const slugify = require('slugify');

const config = JSON.parse(fs.readFileSync('src/data/config.json', { encoding: 'utf8' }));
const { defaultYear, theme } = config;

// theme: { year: color, ... }

const mapEntries = Object.keys(theme).map(y => {
	const slugifiedYear = slugify(y);
	const color = theme[y];
	return `"${slugifiedYear}":${color}`
}).join(',\n');

const map = `$year-colors:(\n${mapEntries}\n);`;
const $primary = theme[defaultYear] ? `$primary: ${theme[defaultYear]};` : '';

fs.writeFileSync('src/scss/_generated.scss', `${map}\n${$primary}`);
