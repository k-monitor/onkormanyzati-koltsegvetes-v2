import fs from 'fs';
import xlsx from 'xlsx';

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/config.json';

export default () => {
	const workbook = xlsx.readFile(INPUT_FILE);
	const json = xlsx.utils.sheet_to_json(workbook.Sheets['config']);

	const configJson = {};
	json.forEach((row) => {
		const fullKey = row['key'];
		const value = row['value'] || '';
		if (!fullKey) return;
		const keyParts = fullKey.split('.');
		let target = configJson;
		for (let i = 0; i < keyParts.length - 1; i++) {
			target[keyParts[i]] = target[keyParts[i]] || {};
			target = target[keyParts[i]];
		}
		target[keyParts[keyParts.length - 1]] = value;
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
};
