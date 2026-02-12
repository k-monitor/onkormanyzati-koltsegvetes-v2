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

json.forEach((row) => {
	const fullKey = row['key'];
	const value = row['value'] || '';
	if (!fullKey) return;
	const keyParts = fullKey.split('\.');
	if (keyParts.length === 3) {
		const group1 = keyParts[0];
		const group2 = keyParts[1];
		const key = keyParts[2];
		const defaultValue = configJson[group1][group2];
		configJson[group1][group2] = {};
		if (defaultValue) {
			configJson[group1][group2]["default"] = defaultValue;
		}
		configJson[group1][group2][key] = value;
	}
});

// Read 'kgr' sheet if it exists — first column contains allowed IDs for time series
if (workbook.Sheets['kgr']) {
	const kgrJson = xlsx.utils.sheet_to_json(workbook.Sheets['kgr'], { header: 1 });
	const kgrIds = kgrJson
		.slice(1) // skip header row
		.map((row) => row[0])
		.filter((id) => id !== undefined && id !== null && String(id).trim() !== '')
		.map((id) => String(id).trim());
	if (kgrIds.length > 0) {
		configJson['timeseries'] = configJson['timeseries'] || {};
		configJson['timeseries']['kgr'] = kgrIds.join(',');
	}
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(configJson));
