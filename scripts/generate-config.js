import fs from 'fs';
import xl from 'excel4node';
import './prepare-functions.js'; // required by prepare-data
import './prepare-data.js'; // required for theme colors & tooltips generation

const defaultConfig = JSON.parse(fs.readFileSync('./scripts/default-config.json', 'utf8'));
const defaultConfigHelp = JSON.parse(fs.readFileSync('./scripts/default-config-help.json', 'utf8'));
const defaultKgr = JSON.parse(fs.readFileSync('./scripts/default-kgr.json', 'utf8'));
const defaultMilestones = JSON.parse(fs.readFileSync('./scripts/default-milestones.json', 'utf8'));
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

function flattenConfig(obj, prefix = '', helpMap = {}) {
	const rows = [];
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			rows.push(...flattenConfig(value, fullKey, helpMap));
		} else {
			rows.push([
				fullKey,
				typeof value === 'number' ? value : String(value ?? ''),
				helpMap[fullKey] || '',
			]);
		}
	}
	return rows;
}

function flattenConfigWithBlanks(obj, helpMap = {}) {
	const rows = [];
	const keys = Object.keys(obj);
	keys.forEach((key, i) => {
		const value = obj[key];
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			rows.push(...flattenConfig(value, key, helpMap));
		} else {
			rows.push([
				key,
				typeof value === 'number' ? value : String(value ?? ''),
				helpMap[key] || '',
			]);
		}
		if (i < keys.length - 1) {
			rows.push(['', '', '']);
		}
	});
	return rows;
}

const defaultConfigRows = flattenConfigWithBlanks(defaultConfig, defaultConfigHelp);

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

const colors = ['#C0D1E3', '#C03B1A', '#0363A0'];

const yearColors = Object.keys(data).map((year, index) => [
	`theme.${year}`,
	colors[index % colors.length],
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
	[
		['key', 'value', 'help'],
		...defaultConfigRows.concat(yearColors).concat(inexColors).concat(visColors),
	],
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

	const tooltipRows = [['Azon.', 'Megnevezés', 'Súgószöveg']];

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
aoaTo3colSheet(
	milestonesSheet,
	defaultMilestones,
	[0, 1, 2, 3, 4, 5, 6, 7],
	[10, 5, 20, 20, 20, 80, 20, 20],
);

// functions sheet

const header = ['id', 'name', 'parent'];
const functionsSheet = wb.addWorksheet('functions');
aoaTo3colSheet(functionsSheet, [header, ...FUNCTIONS_AOA], [], [20, 100, 20]);

// kgr sheet

const kgrRows = Array.from(defaultKgr).map((code) => [code]);
const kgrSheet = wb.addWorksheet('kgr');

aoaTo3colSheet(kgrSheet, [['code'], ...kgrRows], [0, 1], [20, 80]);

wb.write(OUTPUT_FILE);
