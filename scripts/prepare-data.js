import fs from 'fs';
import ExcelJS from 'exceljs';
import { parseBudget } from './prepare-data-lib.ts';

const FUNC_FILE = './src/data/functions.tsv';
const INPUT_FILE = './input/budget.xlsx';
const OUTPUT_FILE = './src/data/data.json';

export default async () => {
	console.log(`Processing file: ${INPUT_FILE}`);
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(INPUT_FILE);

	const funcTreeTsv = fs.readFileSync(FUNC_FILE, 'utf-8');

	const data = parseBudget(workbook, funcTreeTsv);

	writeToFile(JSON.stringify(data), OUTPUT_FILE);
};

function writeToFile(content, filename) {
	if (content && content.length > 0) {
		console.log(`Writing file (${Math.round(content.length / 102.4) / 10} KB): ${filename}`);
		fs.writeFileSync(filename, content);
	}
}
