import fs from 'fs';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/config.json';

const workbook = xlsx.readFile(INPUT_FILE);
const json = xlsx.utils.sheet_to_json(workbook.Sheets['config']);

let configJson = {};
json.forEach((row) => {
	const fullKey = row['key'];
	const value = row['value'] || '';
	if (!fullKey) return;
	const keyParts = fullKey.split('\.');
	if (keyParts.length === 1) {
		configJson[fullKey] = value;
	} else if (keyParts.length === 2) {
		const group = keyParts[0];
		const key = keyParts[1];
		configJson[group] = configJson[group] || {};
		configJson[group][key] = value;
	}
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(configJson));
