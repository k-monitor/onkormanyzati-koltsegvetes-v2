const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/texts-template.xlsx'; // TODO should be texts.xlsx in the end
const OUTPUT_FILE = './src/data/config.json';

const workbook = xlsx.readFile(INPUT_FILE);
const sheetName = workbook.SheetNames[0];
const json = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

let configJson = {};
json.forEach(row => {
	const fullKey = row['Kulcs'];
	const value = row['Érték'];
	if (!fullKey || !value) return;
	const keyParts = fullKey.split('\.');
	const group = keyParts[0];
	const key = keyParts[1];
	configJson[group] = configJson[group] || {};
	configJson[group][key] = value;
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(configJson));
