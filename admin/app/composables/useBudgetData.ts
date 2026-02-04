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
	});

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
	};
});
