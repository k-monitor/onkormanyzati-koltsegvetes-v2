const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const xlsx = require('xlsx');

// configruation

const INPUT_FILE = 'data/src/tápió adatok.xlsx';

// main script

(() => {
	const workbook = xlsx.readFile(INPUT_FILE);
	workbook.SheetNames.forEach(sheet => {
		const year = sheet.split(' ')[0];
		const name = sheet.split(' ')[1]
			.replace('BEVÉTEL', 'income')
			.replace('KIADÁS', 'expense');
		const matrixFile = `data/${year}/${name}.tsv`;

		console.log(`Converting ${INPUT_FILE}[${sheet}] -> ${matrixFile}`);
		const sheetTsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheet], { FS: '\t' });
		convertBudget(sheetTsv, matrixFile);
	});
})();

// lib

function convertBudget(tsv, outputFile) {
	mkdirp(path.dirname(outputFile));
	const outputLines = [];

	let funcIds;
	const rows = tsv.split('\n').splice(1); // remove first row
	rows.forEach((row, i) => {
		const cols = row.split('\t');
		if (i == 0) {
			funcIds = cols.map(s => s.split(' ')[0]);
			funcIds[2] = '*';
		} else if (cols[0].trim().match(/\d{2}/)) { // valid econ ID
			const econId = Number(cols[0]);
			const econDesc = cols[1];
			if (econDesc.indexOf('=') == -1) {
				for (let j = 2; j < cols.length; j++) {
					const outputLine = [
						econId,
						funcIds[j],
						cols[j].replace(/\D+/g, '')
					].join('\t');
					outputLines.push(outputLine);
				}
			}
		}
	});

	fs.writeFileSync(outputFile, outputLines.join('\n'));
}