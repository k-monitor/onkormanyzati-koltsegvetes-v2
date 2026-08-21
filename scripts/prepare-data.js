import fs from 'fs';
import ExcelJS from 'exceljs';
import { parseBudget } from './prepare-data-lib.ts';

const FUNC_FILE = './src/data/functions.tsv';
const CONFIG_FILE = './src/data/config.json';
const INPUT_FILE = './input/budget.xlsx';
const OUTPUT_FILE = './src/data/data.json';

export default async () => {
	console.log(`Processing file: ${INPUT_FILE}`);
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(INPUT_FILE);

	const funcTreeTsv = fs.readFileSync(FUNC_FILE, 'utf-8');

	// The AHT column is only read when the config asks for it, otherwise the
	// regular (AHT-less) format is assumed. Config is prepared before data,
	// but stay silent if it's missing so this script can run standalone.
	const aht = isEnabled(readConfig().timeseries?.aht);
	console.log(`AHT column: ${aht ? 'enabled' : 'disabled'}`);

	const data = parseBudget(workbook, funcTreeTsv, { aht });

	writeToFile(JSON.stringify(data), OUTPUT_FILE);
};

function readConfig() {
	if (!fs.existsSync(CONFIG_FILE)) return {};
	try {
		return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
	} catch {
		console.error('[KÖKÖ]', 'Nem sikerült beolvasni:', CONFIG_FILE);
		return {};
	}
}

// Config values come from XLSX cells, so a "0" may arrive as a string.
function isEnabled(value) {
	const v = String(value ?? '')
		.trim()
		.toLowerCase();
	return v !== '' && v !== '0' && v !== 'false';
}

function writeToFile(content, filename) {
	if (content && content.length > 0) {
		console.log(`Writing file (${Math.round(content.length / 102.4) / 10} KB): ${filename}`);
		fs.writeFileSync(filename, content);
	}
}
