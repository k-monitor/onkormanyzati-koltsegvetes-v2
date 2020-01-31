const fs = require('fs');
const xl = require('excel4node');
const defaultConfig = require('./default-config.json');
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
			} else if (j === inputIndex) {
				cell.style(inputStyle);
			} else if (j === 0) {
				cell.style(keyStyle);
			}
		});
	});
	sheet.column(1).setWidth(colWidths[0]);
	sheet.column(2).setWidth(colWidths[1]);
	sheet.column(3).setWidth(colWidths[2]);
	sheet.row(1).freeze();
}

// config sheet

const configSheet = wb.addWorksheet('config');
aoaTo3colSheet(configSheet, defaultConfig, 1, [25, 40, 100]);

// tooltips sheet

// ids[ID][Name][0..n] = Year
let ids = {};
function gatherIds(node, year) {
	if (!node) return;
	if (node.id) {
		ids[node.id] = ids[node.id] || {};
		ids[node.id][node.name] = ids[node.id][node.name] || [];
		ids[node.id][node.name].push(year);
	}
	if (node.children) {
		node.children.forEach(c => gatherIds(c, year));
	}
}
const data = JSON.parse(fs.readFileSync('./src/data/data.json'));
Object.keys(data).forEach(year => {
	Object.values(data[year]).forEach(side => {
		Object.values(side).forEach(root => {
			gatherIds(root, year);
		});
	});
});
let tooltipRows = [
	['Azon.', 'Megnevezés', 'Súgószöveg'],
	['FB', 'Alaptevékenység finanszírozási egyenlege', 'Itt rövid leírás olvasható a kategóriáról: FB'],
	['RE', 'Alaptevékenység szabad maradványa', 'Itt rövid leírás olvasható a kategóriáról: RE']
];
Object.keys(ids).sort().forEach(id => {
	const names = Object.keys(ids[id]);
	if (names.length === 1) {
		tooltipRows.push([id, names[0], `Itt rövid leírás olvasható a kategóriáról: ${id}`])
	} else {
		names.forEach(name => {
			const years = ids[id][name];
			years.forEach(year => {
				tooltipRows.push([`${id}/${year}`, name, `Itt rövid leírás olvasható a kategóriáról: ${id}/${year}`]);
			});
		});
	}
});
const tooltipsSheet = wb.addWorksheet('tooltips');
aoaTo3colSheet(tooltipsSheet, tooltipRows, 2, [10, 50, 100]);

wb.write(OUTPUT_FILE);