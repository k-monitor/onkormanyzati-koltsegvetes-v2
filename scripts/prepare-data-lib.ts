import type { BudgetData, BudgetNode } from '../src/utils/types.ts';
import type ExcelJS from 'exceljs';

export function sheetToMatrix(sheet: ExcelJS.Worksheet) {
	const matrix: ExcelJS.CellValue[][] = [];
	for (let ri = 1; ri <= sheet.rowCount; ri++) {
		const row = sheet.getRow(ri);
		const matrixRow: ExcelJS.CellValue[] = [];
		for (let ci = 1; ci <= sheet.columnCount; ci++) {
			const cell = row.getCell(ci);
			const value = cell.result || cell.value;
			matrixRow.push(value === null || value === undefined ? '' : value);
		}
		matrix.push(matrixRow);
	}
	return matrix;
}

export function parseBudget(workbook: ExcelJS.Workbook, funcTreeTsv: string) {
	const data: BudgetData = {};

	workbook.eachSheet((sheet) => {
		const sheetName = sheet.name;
		console.log(`Reading sheet: ${sheetName}`);

		const parsedSheetName = parseSheetName(sheetName);
		if (parsedSheetName) {
			const { year, side } = parsedSheetName;

			const matrix = sheetToMatrix(sheet);

			data[year] = data[year] || {};
			data[year][side] = data[year][side] || {};

			console.log('Generating economic tree');
			data[year][side]['econ'] = generateEconomicTree(matrix);

			console.log('Generating functional tree');
			data[year][side]['func'] = generateFunctionalTree(matrix, funcTreeTsv);
		} else {
			console.error('[KÖKÖ]', 'Érvénytelen munkalap név budget.xlsx-ben:', sheetName);
		}
	});

	return data;
}

function generateEconomicTree(matrix: ExcelJS.CellValue[][]) {
	const nodes: Record<string, BudgetNode> = {};

	// collecting all nodes

	[...matrix]
		.splice(2) // header is at least 2 rows
		.filter((row) => row[0]?.toString().match(/^\d{2,}/)) // we need rows that start with valid economic category ID
		.forEach((row, i) => {
			const [_, descriptor, rawValue] = row; // we need only the 2nd and 3rd column
			const { id: rawId, name } = parseEconomicDescriptor(descriptor?.toString() || '');
			const value = Number((rawValue?.toString() || '').replace(/[^0-9-]+/g, ''));
			if (rawId && rawId.indexOf('-') == -1) {
				let id = rawId;
				if (name.startsWith('ebből:') || nodes[id]) {
					id = `${id}:${i}`;
				}
				nodes[id] = {
					id,
					name,
					value,
				};
			}
		});

	// transforming into tree / handling "ebből:" rows
	Object.keys(nodes)
		.filter((id) => id.includes(':'))
		.forEach((id) => {
			const parentId = id.split(':')[0];
			if (nodes[parentId]) {
				nodes[parentId].children = nodes[parentId].children || [];
				nodes[parentId].children.push(nodes[id]);
			}
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete nodes[id];
		});

	// transforming into tree / connecting parents with children
	const sortedIds = Object.keys(nodes).sort();
	const deletableIds: string[] = [];
	for (let i = 0; i < sortedIds.length; i++) {
		const id = sortedIds[i];
		if (id.length == 2 || id.startsWith('F')) continue; // root nodes, incl. FH1, FH2, FT1, FT2
		let j = i - 1;
		for (; j >= 0 && sortedIds[j].length >= id.length; j--);
		if (j > -1) {
			// found parent
			const parentId = sortedIds[j];
			nodes[parentId].children = nodes[parentId].children || [];
			nodes[parentId].children.push(nodes[id]);
			deletableIds.push(id);
		}
	}

	// cleanup
	Object.keys(nodes)
		.filter((id) => deletableIds.includes(id))
		.forEach((id) => {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete nodes[id];
		});

	// we dropped out total sum line (via id filter) so we calculate it
	const children: BudgetNode[] = Object.values(nodes);
	const value = children
		.filter((n) => !String(n.id || '').startsWith('F')) // skipping FH1, FH2, FT1, FT2
		.map((n) => n.value)
		.reduce((sum, v) => sum + v, 0);
	const root: BudgetNode = {
		name: 'Összesen',
		children,
		value,
	};

	return root;
}

function generateFunctionalTree(matrix: ExcelJS.CellValue[][], funcTreeTsv: string) {
	const nodes = parseFunctionalTreeDescriptor(funcTreeTsv) as Record<number, BudgetNode>;

	const rows = [...matrix];

	const header = rows[1].map((col) => Number(col?.toString().trim().split(' ')[0]));
	if (header.length > 3) {
		// finding the total row
		let max = 0,
			maxRow: ExcelJS.CellValue[] = [];
		rows.forEach((row) => {
			const sum = Number((row[2]?.toString() || '0').replace(/\D+/g, ''));
			if (sum > max) {
				max = sum;
				maxRow = row;
			}
		});

		// collecting total values for nodes
		maxRow.forEach((col, i) => {
			if (i > 2 && i < header.length) {
				const id = header[i];
				if (!id) return;
				if (!nodes[id]) {
					console.error(
						'[KÖKÖ]',
						'Budget-ben szereplő ID hiányzik a funkcionális fából:',
						id,
					);
					return;
				}
				nodes[id].value = Number(col?.toString().replace(/\D+/g, ''));
			}
		});

		// transforming into tree
		const deletableIds: unknown[] = [];
		Object.values(nodes).forEach((node) => {
			if (node.parent) {
				const parentId = Number(node.parent);
				if (nodes[parentId]) {
					nodes[parentId].children = (nodes[parentId].children || []).concat(node);
					deletableIds.push(node.id);
				} else {
					console.error(
						'[KÖKÖ]',
						'Szülő funkcionális kategória nem található:',
						node.parent,
					);
				}
			}
		});
		Object.values(nodes)
			.filter((node) => deletableIds.includes(node.id))
			.forEach((node) => {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete nodes[node.id as number];
			});
		const root: BudgetNode = {
			name: 'Összesen',
			children: Object.values(nodes) as BudgetNode[],
			value: 0,
		};

		// calculating sums
		function sumNode(node: BudgetNode) {
			if (node.children) {
				node.value = node.children
					.map((n) => sumNode(n))
					.reduce((sum, node) => sum + (node.value || 0), 0);
			}
			return node;
		}
		sumNode(root);

		// cleaning up
		function cleanUp(node: BudgetNode) {
			if (node.children) {
				node.children = node.children.filter((n) => n.value && n.value > 0);
				node.children.forEach(cleanUp);
			}
		}
		cleanUp(root);

		if (root.value > 0) return root;
	}

	console.log('No functional data found.');
	return null;
}

function parseEconomicDescriptor(descriptor: string) {
	let id, m;

	if ((m = descriptor.match(/ \(((B|K|FH|FT)[0-9-]+)\)/))) {
		id = m[1];
	}

	let name = descriptor.replace(`(${id})`, '');
	if ((m = descriptor.match(/[^§]{10} \(?\(?([>=]*[0-9+….]+)\)/))) {
		name = name.replace(m[1], '');
	}
	name = name
		.replace(/\(\)+ *$/, '')
		.replace(/\(+$/, '')
		.trim();

	return { id, name };
}

/**
 * @returns Functional tree nodes inside an object where key is the `id`
 */
function parseFunctionalTreeDescriptor(tsv: string) {
	const nodes: Record<number, { id: number; name: string; parent: number | null }> = {};
	tsv.split('\n').forEach((row) => {
		if (!row.trim().length) return;
		const [rawId, name, rawParent] = row.split('\t');
		const id = Number(rawId);
		let parent: number | null = Number('0' + rawParent.replace(/\D+/g, ''));
		parent = parent > 0 ? parent : null;
		nodes[id] = { id, name, parent };
	});
	return nodes;
}

function parseSheetName(sheetName: string) {
	/*
		2020_kiadas
		2020 KIADÁS
		2020 MÓDOSÍTOTT BEVÉTEL
	*/
	sheetName = sheetName.replace(/BEV[EÉ]TEL$/i, 'income').replace(/KIAD[AÁ]S$/i, 'expense');

	const sideMatch = sheetName.match(/[ _](income|expense)$/);
	if (!sideMatch) return null;

	const side = sideMatch[1] as 'income' | 'expense';
	const year = sheetName.substring(0, sideMatch.index);
	return { year, side };
}
