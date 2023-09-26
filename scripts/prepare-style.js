const fs = require('fs');
const slugify = require('slugify');

const config = JSON.parse(fs.readFileSync('src/data/config.json', { encoding: 'utf8' }));
const data = JSON.parse(fs.readFileSync('src/data/data.json', { encoding: 'utf8' }));

const { defaultYear, font, theme } = config;

const fontKeys = {
	base: '$font-family-base',
	headings: '$headings-font-family',
	vis: '$vis-font-family'
};
const $fonts = Object.keys(fontKeys).map(configKey => {
	const fontFamily = ((font || {})[configKey] || '').trim();
	const scssVar = fontKeys[configKey];
	return fontFamily.length ? `${scssVar}: "${fontFamily}";\n` : '';
}).join('');

// theme: { year: color, ... }
const defaultColor = theme[defaultYear] || '#0d6efd'; // fallback to BS $primary
const years = Object.keys(data);

const mapEntries = years.map(y => {
	const slugifiedYear = slugify(y);
	const color = theme[y] || defaultColor;
	return `"${slugifiedYear}":${color}`
}).join(',\n');

const $yearColors = `$year-colors:(\n${mapEntries}\n);\n`;
const $primary = theme[defaultYear] ? `$primary: ${defaultColor};\n` : '';

fs.writeFileSync('src/scss/_generated.scss', [
	font.imports,
	$fonts,
	$primary,
	$yearColors
].join('\n'));
