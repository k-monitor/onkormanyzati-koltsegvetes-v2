const fs = require('fs');
const xl = require('excel4node');
const defaultConfig = require('./default-config.json');
const defaultMilestones = require('./default-milestones.json');
require('./prepare-data'); // required for tooltips generation

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

function aoaTo3colSheet(sheet, aoa, inputIndex, colWidths) {
	aoa.forEach((r, i) => {
		r.forEach((c, j) => {
			const cell = sheet.cell(i + 1, j + 1);
			if (typeof c === 'number') {
				cell.number(c);
			} else {
				cell.string(c);
			}
			if (i === 0) {
				cell.style(headerStyle);
			} else if (inputIndex.indexOf(j) > -1) {
				cell.style(inputStyle);
			}/* else if (j === 0) {
				cell.style(keyStyle);
			}*/
		});
	});
	colWidths.forEach((w, i) => {
		sheet.column(i + 1).setWidth(w);
	});
	sheet.row(1).freeze();
}

// config sheet

const configSheet = wb.addWorksheet('config');
aoaTo3colSheet(configSheet, defaultConfig, [1], [25, 40, 100]);

// tooltips sheets

// ids[ID][Name][0..n] = Year

function gatherIds(ids, node) {
	if (!node) return;
	if (node.id) {
		ids[node.id] = node.name;
	}
	if (node.children) {
		node.children.forEach(c => gatherIds(ids, c));
	}
}

const data = JSON.parse(fs.readFileSync('./src/data/data.json'));
Object.keys(data).forEach(year => {
	const ids = {};
	Object.values(data[year]).forEach(sideObj => {
		Object.values(sideObj).forEach(treeRoot => {
			gatherIds(ids, treeRoot);
		});
	});

	let tooltipRows = [
		['Azon.', 'Megnevezés', 'Súgószöveg'],
	];

	Object.keys(ids).sort().forEach(id => {
		const name = ids[id];
		tooltipRows.push([id, name, `Itt rövid leírás olvasható a kategóriáról: ${id}`]);
	});

	const tooltipsSheet = wb.addWorksheet('tooltips ' + year);
	aoaTo3colSheet(tooltipsSheet, tooltipRows, [2], [10, 50, 100]);
});

// milestones sheet

const milestonesSheet = wb.addWorksheet('milestones');
aoaTo3colSheet(milestonesSheet, defaultMilestones, [0, 1, 2, 3, 4, 5], [10, 5, 20, 20, 20, 80]);

wb.write(OUTPUT_FILE);