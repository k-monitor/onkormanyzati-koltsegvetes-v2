import ExcelJS from 'exceljs';
import type { BudgetData } from '../../../src/utils/types';
import { parseBudget, parseSheetName } from '../../../scripts/prepare-data-lib';

export default createGlobalState(async () => {
	const workbook = shallowRef<ExcelJS.Workbook | null>(null);
	const functions = shallowRef<string | null>(null);
	const data = shallowRef<BudgetData | null>(null);

	const sheets = computed(() => {
		if (!workbook.value) return [];
		const r: { name: string; year: string; side: 'income' | 'expense' }[] = [];
		workbook.value.eachSheet((sheet) => {
			const parsed = parseSheetName(sheet.name);
			if (!parsed) return;
			r.push({
				name: sheet.name,
				year: parsed.year,
				side: parsed.side,
			});
		});
		return r;
	}); // FIXME this needs to be recalculated when new year is added or a new workbook is uploaded

	const years = computed(() => {
		const map = new Map<string, { incomeSheet: string; expenseSheet: string }>();
		sheets.value.forEach((sheet) => {
			if (!map.has(sheet.year)) {
				map.set(sheet.year, { incomeSheet: '', expenseSheet: '' });
			}
			const entry = map.get(sheet.year)!;
			if (sheet.side === 'income') {
				entry.incomeSheet = sheet.name;
			} else if (sheet.side === 'expense') {
				entry.expenseSheet = sheet.name;
			}
		});
		const r: Record<string, { incomeSheet: string; expenseSheet: string }> = {};
		map.forEach((value, key) => {
			r[key] = value;
		});
		return r;
	});

	const pending = ref(false);

	async function loadBudgetXlsxFromServer() {
		pending.value = true;
		try {
			const buffer = await $fetch<ArrayBuffer>('/input/budget.xlsx', {
				responseType: 'arrayBuffer',
			});
			const wb = new ExcelJS.Workbook();
			await wb.xlsx.load(buffer);
			workbook.value = wb;
		} catch (error) {
			console.error('Error loading budget.xlsx from server:', error);
		} finally {
			pending.value = false;
		}
	}

	async function downloadXlsxFromClient() {
		if (!workbook.value) return;
		const buffer = await workbook.value.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `budget-${new Date().toLocaleDateString().replaceAll(/\D/g, '')}.xlsx`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function uploadBudgetXlsxToServer() {
		if (!workbook.value) return;
		let success = false;
		pending.value = true;
		const buffer = await workbook.value.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		const formData = new FormData();
		formData.append('budget', blob, 'budget.xlsx');
		try {
			const response = await fetch('/api/budget', {
				method: 'POST',
				body: formData,
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			success = true;
		} catch (error) {
			console.error('Error uploading workbook:', error);
		} finally {
			pending.value = false;
		}
		return success;
	}

	async function loadFunctionsTsvFromServer() {
		pending.value = true;
		try {
			const tsvContent = await $fetch<string>('/data/functions.tsv');
			functions.value = tsvContent;
		} catch (error) {
			console.error('Error loading functions.tsv from server:', error);
		} finally {
			pending.value = false;
		}
	}

	function prepareBudgetData() {
		if (!workbook.value) {
			console.log('Cannot prepare budget data as workbook is not loaded.');
			return;
		}
		if (!functions.value) {
			console.log('Cannot prepare budget data as functions are not loaded.');
			return;
		}
		pending.value = true;
		data.value = parseBudget(workbook.value, functions.value);
		pending.value = false;
	}

	onMounted(async () => {
		if (!workbook.value) {
			await loadBudgetXlsxFromServer();
		}
		if (!functions.value) {
			await loadFunctionsTsvFromServer();
		}
	});

	function findSheet(year: string, side: 'income' | 'expense') {
		if (!workbook.value) return null;
		const sheetName = sheets.value.find((s) => s.year === year && s.side === side)?.name;
		if (!sheetName) return null;
		return workbook.value.getWorksheet(sheetName);
	}
	// FIXME memoize getSheet, clear cache when sheets changes

	function findEconRow(sheet: ExcelJS.Worksheet, nodeId: string | number) {
		for (let ri = 3; ri <= sheet.rowCount; ri++) {
			// index is 1-based, header is at least 2 rows
			const row = sheet.getRow(ri);
			const cellValue = row.getCell(2).value?.toString() || '';
			const needle = `(${nodeId})`;
			if (cellValue.includes(needle)) {
				return row;
			}
			// FIXME currently only finds top level nodes
		}
		return null;
	}

	function readEconValue(year: string, side: 'income' | 'expense', nodeId: string | number) {
		const sheet = findSheet(year, side);
		if (!sheet) return null;
		const row = findEconRow(sheet, nodeId);
		if (!row) return null;
		const valueCell = row.getCell(3);
		const rawValue = (valueCell.result || valueCell.value)?.toString() || '';
		return Number(rawValue.replace(/[^0-9-]+/g, ''));
	}

	function writeEconValue(
		year: string,
		side: 'income' | 'expense',
		nodeId: string | number,
		value: number,
	) {
		const sheet = findSheet(year, side);
		if (!sheet) return;
		const row = findEconRow(sheet, nodeId);
		if (!row) return;
		const valueCell = row.getCell(3);
		valueCell.value = value;
	}

	return {
		data,
		pending,
		sheets,
		workbook,
		years,
		loadBudgetXlsxFromServer,
		downloadXlsxFromClient,
		uploadBudgetXlsxToServer,
		prepareBudgetData,
		readEconValue,
		writeEconValue,
	};
});
