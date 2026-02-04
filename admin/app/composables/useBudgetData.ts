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
		// FIXME slow
		pending.value = false;
	}

	// FIXME uploadBudgetXlsxToServer

	onMounted(async () => {
		if (!workbook.value) {
			await loadBudgetXlsxFromServer();
		}
		if (!functions.value) {
			await loadFunctionsTsvFromServer();
		}
	});

	return {
		sheets,
		workbook,
		years,
		loadBudgetXlsxFromServer,
		prepareBudgetData,
		data,
		pending,
	};
});
