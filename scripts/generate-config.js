const xl = require('excel4node');
const defaultConfig = require('./default-config.json');

const BUDGET_FILE = "input/budget.xlsx";
const OUTPUT_FILE = "input/config.xlsx";

const wb = new xl.Workbook();

const blue = '#00396C';
const yellow = '#FFE7A4';

const headerStyle = wb.createStyle({
	fill: {
		bgColor: blue,
		fgColor: blue,
		patternType: 'solid',
		type: 'pattern'
	},
	font: {
		bold: true,
		color: '#FFFFFF'
	}
});

const keyStyle = wb.createStyle({
	font: {
		color: '#999999',
		italics: true
	}
});

const inputStyle = wb.createStyle({
	fill: {
		bgColor: yellow,
		fgColor: yellow,
		patternType: 'solid',
		type: 'pattern'
	},
	font: {
		color: blue
	}
});

function aoaTo3colSheet(sheet, aoa) {
	aoa.forEach((r, i) => {
		r.forEach((c, j) => {
			const cell = sheet.cell(i + 1, j + 1);
			if (c.toString().match(/^\d+$/)) {
				cell.number(c);
			} else {
				cell.string(c);
			}
			if (i === 0) {
				cell.style(headerStyle);
			} else if (j === 1) {
				cell.style(inputStyle);
			} else if (j === 0) {
				cell.style(keyStyle);
			}
		});
	});
	sheet.column(1).setWidth(25);
	sheet.column(2).setWidth(40);
	sheet.column(3).setWidth(100);
	sheet.row(1).freeze();
}

const configSheet = wb.addWorksheet('config');
aoaTo3colSheet(configSheet, defaultConfig);

wb.write(OUTPUT_FILE);