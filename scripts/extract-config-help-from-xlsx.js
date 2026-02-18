/**
 * Standalone script to generate the initial default-config-help.json
 * from an existing config.xlsx file.
 *
 * Usage:
 *   node extract-config-help-from-xlsx.js [path/to/config.xlsx]
 *
 * Defaults to ./input/config.xlsx if no argument is given.
 * Output: ./scripts/default-config-help.json
 *
 * Prerequisites:
 *   npm install xlsx   (or use the project's existing dependency)
 */

import fs from 'fs';
import xlsx from 'xlsx';

const INPUT_FILE = process.argv[2] || './input/config.xlsx';
const OUTPUT_FILE = './scripts/default-config-help.json';

if (!fs.existsSync(INPUT_FILE)) {
	console.error(`File not found: ${INPUT_FILE}`);
	process.exit(1);
}

const workbook = xlsx.readFile(INPUT_FILE);
const sheet = workbook.Sheets['config'];

if (!sheet) {
	console.error('No "config" sheet found in the workbook.');
	process.exit(1);
}

const rows = xlsx.utils.sheet_to_json(sheet);

const helpMap = {};
for (const row of rows) {
	const key = row['key'];
	const help = row['help'];
	if (key && help && String(help).trim() !== '') {
		helpMap[String(key).trim()] = String(help).trim();
	}
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(helpMap, null, '\t') + '\n');
console.log(`Wrote ${Object.keys(helpMap).length} help entries to ${OUTPUT_FILE}`);
