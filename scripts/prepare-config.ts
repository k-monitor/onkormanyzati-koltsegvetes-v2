import fs from 'fs';
import ExcelJS from 'exceljs';

const INPUT_FILE = './input/config.xlsx';
const OUTPUT_FILE = './src/data/config.json';

export default async () => {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(INPUT_FILE);
	const sheet = workbook.getWorksheet('config');

	const configJson = {};
	sheet?.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const fullKey = String(row.getCell(1).value || '');
		if (!fullKey) return;

		let value = row.getCell(2).value || '';
		if (typeof value === 'object') {
			if (value.text) value = value.text;
			else if (value.richText) {
				value = value.richText.map((part) => part.text).join('');
			}
		}
		const keyParts = fullKey.split('.');
		let target = configJson;
		for (let i = 0; i < keyParts.length - 1; i++) {
			target[keyParts[i]] = target[keyParts[i]] || {};
			target = target[keyParts[i]];
		}
		target[keyParts[keyParts.length - 1]] = value;
	});

	// Read 'kgr' sheet if it exists — first column contains allowed IDs for time series
	const kgrSheet = workbook.getWorksheet('kgr');
	if (kgrSheet) {
		const kgrIds: string[] = [];
		kgrSheet.eachRow((row, rowNumber) => {
			if (rowNumber === 1) return;
			const id = String(row.getCell(1).value || '').trim();
			if (!id) return;
			kgrIds.push(id);
		});
		if (kgrIds.length > 0) {
			configJson['timeseries'] = configJson['timeseries'] || {};
			configJson['timeseries']['kgr'] = kgrIds.join(',');
		}
	}

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(configJson));
};
