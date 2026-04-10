import type { BudgetData, BudgetNode } from '../src/utils/types.ts';
import type ExcelJS from 'exceljs';

export function parseBudget(workbook: ExcelJS.Workbook, funcTreeTsv: string) {
	const data: BudgetData = {};

	const emptyFuncTree = parseFunctionalTreeDescriptor(funcTreeTsv) as Record<number, BudgetNode>;

	workbook.eachSheet((sheet) => {
		const sheetName = sheet.name;
		console.log(`Reading sheet: ${sheetName}`);

		const parsedSheetName = parseSheetName(sheetName);
		if (parsedSheetName) {
			const { year, side } = parsedSheetName;

			data[year] = data[year] || {};
			data[year][side] = data[year][side] || {};

			console.log('Generating economic tree');
			data[year][side]['econ'] = generateEconomicTree(sheet);

			const copyOfEmptyFuncTree = structuredClone(emptyFuncTree);

			console.log('Generating functional tree');
			const func = generateFunctionalTree(sheet, copyOfEmptyFuncTree);
			data[year][side]['func'] = func;
			if (!func) console.log('No functional data found.');
		} else {
			console.error('[KÖKÖ]', 'Érvénytelen munkalap név budget.xlsx-ben:', sheetName);
		}
	});

	return data;
}

export function generateEconomicTree(sheet: ExcelJS.Worksheet) {
	const nodes: Record<string, BudgetNode> = {};

	// collecting all nodes

	let i = 0; // used in generated IDs for "ebből:" rows to be backward-compatible
	for (let ri = 3; ri <= sheet.rowCount; ri++) {
		// ^ index is 1-based, header is at least 2 rows
		const row = sheet.getRow(ri);

		const firstCell = row.getCell(1).value?.toString();
		if (!firstCell?.match(/^\d{2,}/)) continue;
		// we need rows that start with valid economic category ID

		i++;
		const descriptor = row.getCell(2).value?.toString() || '';
		const valueCell = row.getCell(3);
		const rawValue = (valueCell.result || valueCell.value)?.toString() || '';

		const { id: rawId, name } = parseEconomicDescriptor(descriptor);
		const value = Number(rawValue.replace(/[^0-9-]+/g, ''));
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
	}

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

export function generateFunctionalTree(
	sheet: ExcelJS.Worksheet,
	nodes: Record<number, BudgetNode>,
) {
	const headerRow = sheet.getRow(2);
	if (headerRow.cellCount <= 3) return null;

	// finding the total row (by econ values)
	let max = 0;
	let maxRow: ExcelJS.Row | null = null;
	for (let ri = 3; ri <= sheet.rowCount; ri++) {
		const row = sheet.getRow(ri);
		const valueCell = row.getCell(3);
		const valueStr = (valueCell.result || valueCell.value)?.toString() || '0';
		const value = Number(valueStr.replace(/\D+/g, ''));
		if (value > max) {
			max = value;
			maxRow = row;
		}
	}

	if (!maxRow) return null;

	// collecting total values for nodes
	for (let ci = 4; ci <= headerRow.cellCount; ci++) {
		// ^ index is 1-based, func values start at 4th column
		const headerValue = headerRow.getCell(ci)?.value?.toString() || '';
		const id = Number(headerValue.split(' ')[0]);
		if (!id) continue;
		if (!nodes[id]) {
			console.error('[KÖKÖ]', 'Budget-ben szereplő ID hiányzik a funkcionális fából:', id);
			continue;
		}
		const valueCell = maxRow.getCell(ci);
		const valueStr = (valueCell.result || valueCell.value)?.toString() || '';
		const value = Number(valueStr.replace(/\D+/g, ''));
		nodes[id].value = value;
	}

	// transforming into tree
	const deletableIds: unknown[] = [];
	Object.values(nodes).forEach((node) => {
		if (node.parent) {
			const parentId = Number(node.parent);
			if (nodes[parentId]) {
				nodes[parentId].children = (nodes[parentId].children || []).concat(node);
				deletableIds.push(node.id);
			} else {
				console.error('[KÖKÖ]', 'Szülő funkcionális kategória nem található:', node.parent);
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

	return root.value > 0 ? root : null;
}

function parseEconomicDescriptor(descriptor: string) {
	let id, m;

	if ((m = descriptor.match(/\(((B|K|FH|FT)[0-9-]+)\)/))) {
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
export function parseFunctionalTreeDescriptor(tsv: string) {
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

export function parseSheetName(sheetName: string) {
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
