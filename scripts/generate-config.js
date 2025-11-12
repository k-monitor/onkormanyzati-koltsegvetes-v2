import fs from 'fs';
import xl from 'excel4node';
import defaultConfig from './default-config.json';
import defaultMilestones from './default-milestones.json';
import './prepare-functions.js'; // required by prepare-data
import './prepare-data.js'; // required for theme colors & tooltips generation

const data = JSON.parse(fs.readFileSync('./src/data/data.json'));

const GENERATED_FUNCTIONS = './src/data/functions.tsv';
const DEFAULT_FUNCTIONS = './scripts/default-functions.tsv';
const FUNCTIONS_TO_USE = fs.existsSync(GENERATED_FUNCTIONS)
	? GENERATED_FUNCTIONS
	: DEFAULT_FUNCTIONS;
const FUNCTIONS_TSV = fs.readFileSync(FUNCTIONS_TO_USE, { encoding: 'utf8' });
const FUNCTIONS_AOA = FUNCTIONS_TSV.trim()
	.split('\n')
	.filter((line) => line.length)
	.map((line) => line.trim().split('\t'));
const OUTPUT_FILE = 'input/config.xlsx';
const blue = '#00396C';
const yellow = '#FFE7A4';

const wb = new xl.Workbook();

const headerStyle = wb.createStyle({
	fill: {
		bgColor: blue,
		fgColor: blue,
		patternType: 'solid',
		type: 'pattern',
	},
	font: {
		bold: true,
		color: '#FFFFFF',
	},
});

const inputStyle = wb.createStyle({
	fill: {
		bgColor: yellow,
		fgColor: yellow,
		patternType: 'solid',
		type: 'pattern',
	},
	font: {
		color: blue,
	},
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
			}
		});
	});
	colWidths.forEach((w, i) => {
		sheet.column(i + 1).setWidth(w);
	});
	sheet.row(1).freeze();
}

// config sheet

const yearColors = Object.keys(data).map((year) => [
	`theme.${year}`,
	'royalblue',
	`CSS szín ehhez az évhez: ${year}`,
]);

const topLevelIds = {};
Object.keys(data).forEach((year) => {
	['expense', 'income'].forEach((side) => {
		data[year][side].econ.children.forEach((n) => (topLevelIds[n.id] = n.name));
	});
});
const inexColors = Object.keys(topLevelIds)
	.sort()
	.map((id) => [`inex.${id}`, '', `CSS szín a Mérleg ábrán ehhez: ${topLevelIds[id]}`]);
const visColors = Object.keys(topLevelIds)
	.sort()
	.map((id) => [
		`color.${id}`,
		'royalblue',
		`CSS szín a Bevétel/Kiadás ábrán ehhez: ${topLevelIds[id]}`,
	]);

const configSheet = wb.addWorksheet('config');
aoaTo3colSheet(
	configSheet,
	defaultConfig.concat(yearColors).concat(inexColors).concat(visColors),
	[1],
	[25, 40, 100],
);

// tooltips sheets

// ids[ID][Name][0..n] = Year

function gatherIds(ids, node) {
	if (!node) return;
	if (node.id) {
		ids[node.id] = node.name;
	}
	if (node.children) {
		node.children.forEach((c) => gatherIds(ids, c));
	}
}

Object.keys(data).forEach((year) => {
	const ids = {};
	FUNCTIONS_AOA.forEach((r) => {
		const id = r[0];
		const name = r[1];
		ids[id] = name;
	});
	Object.values(data[year]).forEach((sideObj) => {
		Object.values(sideObj).forEach((treeRoot) => {
			gatherIds(ids, treeRoot);
		});
	});

	let tooltipRows = [['Azon.', 'Megnevezés', 'Súgószöveg']];

	Object.keys(ids)
		.sort()
		.forEach((id) => {
			const name = ids[id];
			tooltipRows.push([id, name, `Itt rövid leírás olvasható a kategóriáról: ${id}`]);
		});

	const tooltipsSheet = wb.addWorksheet('tooltips ' + year);
	aoaTo3colSheet(tooltipsSheet, tooltipRows, [2], [10, 50, 100]);
});

// milestones sheet

const milestonesSheet = wb.addWorksheet('milestones');
aoaTo3colSheet(milestonesSheet, defaultMilestones, [0, 1, 2, 3, 4, 5], [10, 5, 20, 20, 20, 80]);

// functions sheet

const header = ['id', 'name', 'parent'];
const functionsSheet = wb.addWorksheet('functions');
aoaTo3colSheet(functionsSheet, [header, ...FUNCTIONS_AOA], [], [20, 100, 20]);

wb.write(OUTPUT_FILE);
