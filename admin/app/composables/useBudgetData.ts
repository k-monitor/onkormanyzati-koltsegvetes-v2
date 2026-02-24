import ExcelJS from 'exceljs';
import { parseFunctionalTreeDescriptor, parseSheetName } from '../../../scripts/prepare-data-lib';
import type { BudgetNode } from '../../../src/utils/types';

export default createGlobalState(async () => {
	const pending = ref(false);

	// modified state

	const isModified = ref(false);

	function markModified() {
		isModified.value = true;
	}

	// xlsx

	const workbook = shallowRef<ExcelJS.Workbook | null>(null);

	async function loadBudgetXlsxFromServer() {
		pending.value = true;
		try {
			const buffer = await $fetch<ArrayBuffer>('/input/budget.xlsx', {
				responseType: 'arrayBuffer',
			});
			const wb = new ExcelJS.Workbook();
			await wb.xlsx.load(buffer);
			workbook.value = wb;
			isModified.value = false;
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

	// years

	const years = ref<Record<string, { incomeSheet: string; expenseSheet: string }> | null>(null);

	function enumerateYears() {
		if (!workbook.value) return;
		const map = new Map<string, { incomeSheet: string; expenseSheet: string }>();
		workbook.value.eachSheet((sheet) => {
			const parsed = parseSheetName(sheet.name);
			if (!parsed) return;
			if (!map.has(parsed.year)) {
				map.set(parsed.year, { incomeSheet: '', expenseSheet: '' });
			}
			const entry = map.get(parsed.year)!;
			if (parsed.side === 'income') {
				entry.incomeSheet = sheet.name;
			} else if (parsed.side === 'expense') {
				entry.expenseSheet = sheet.name;
			}
		});
		years.value = Object.fromEntries(map.entries());
	}

	watch(workbook, () => {
		// recalculates when workbook is reloaded (upload, year rename, year delete)
		enumerateYears();
	});

	// functions

	const emptyFuncTree = shallowRef<Record<number, BudgetNode> | null>(null);

	async function loadFunctionsTsvFromServer() {
		pending.value = true;
		try {
			const funcTreeTsv = await $fetch<string>('/data/functions.tsv');
			emptyFuncTree.value = parseFunctionalTreeDescriptor(funcTreeTsv) as Record<
				number,
				BudgetNode
			>;
		} catch (error) {
			console.error('Error loading functions.tsv from server:', error);
		} finally {
			pending.value = false;
		}
	}

	// mount logic

	onMounted(async () => {
		if (!workbook.value) {
			await loadBudgetXlsxFromServer();
		}
		if (!emptyFuncTree.value) {
			await loadFunctionsTsvFromServer();
		}
	});

	return {
		pending,
		emptyFuncTree,
		loadBudgetXlsxFromServer,
		workbook,
		downloadXlsxFromClient,
		uploadBudgetXlsxToServer,
		years,
		isModified: readonly(isModified),
		markModified,
	};
});
