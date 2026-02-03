import ExcelJS from 'exceljs';
import type { BudgetData } from '../../../src/utils/types';
import { parseBudget } from '../../../scripts/prepare-data-lib';

export default async () => {
	const workbook = useState<ExcelJS.Workbook | null>('budget.xlsx', () => null);
	const functions = useState<string | null>('functions.tsv', () => null);
	const data = useState<BudgetData | null>('budget-data', () => null);

	const pending = useState<boolean>('budget-data-pending', () => false);

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
		if (!data.value) {
			prepareBudgetData();
		}
	});

	return {
		loadBudgetXlsxFromServer,
		prepareBudgetData,
		data,
		pending,
	};
};
