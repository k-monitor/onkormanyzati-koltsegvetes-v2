import ExcelJS from 'exceljs';
import { parseFunctionalTreeDescriptor, parseSheetName } from '../../../scripts/prepare-data-lib';
import type { BudgetNode } from '../../../src/utils/types';

export default createGlobalState(async () => {
	// modified state

	const isModified = ref(false);

	function markModified() {
		isModified.value = true;
	}

	const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = true;
	};

	watch(isModified, (newValue) => {
		if (newValue) {
			console.log('ADDING beforeunload listener');
			window.addEventListener('beforeunload', beforeUnloadHandler);
		} else {
			console.log('REMOVING beforeunload listener');
			window.removeEventListener('beforeunload', beforeUnloadHandler);
		}
	});

	// xlsx

	const workbook = shallowRef<ExcelJS.Workbook | null>(null);
	const workbookPending = ref(false);

	async function loadBudgetXlsxFromServer() {
		if (workbookPending.value) return;
		workbookPending.value = true;
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
			workbookPending.value = false;
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
		if (workbookPending.value) return;
		if (!workbook.value) return;
		let success = false;
		workbookPending.value = true;
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
			workbookPending.value = false;
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
	const functionsPending = ref(false);

	async function loadFunctionsTsvFromServer() {
		if (functionsPending.value) return;
		functionsPending.value = true;
		try {
			const funcTreeTsv = await $fetch<string>('/data/functions.tsv');
			emptyFuncTree.value = parseFunctionalTreeDescriptor(funcTreeTsv) as Record<
				number,
				BudgetNode
			>;
		} catch (error) {
			console.error('Error loading functions.tsv from server:', error);
		} finally {
			functionsPending.value = false;
		}
	}

	// loading state

	const pending = computed(() => workbookPending.value || functionsPending.value);

	const loading = useLoading();
	watch(pending, (newValue) => {
		loading.value = newValue;
	});

	// mount logic

	onMounted(async () => {
		const promises: Promise<void>[] = [];
		if (!workbook.value) promises.push(loadBudgetXlsxFromServer());
		if (!emptyFuncTree.value) promises.push(loadFunctionsTsvFromServer());
		if (promises.length > 0) await Promise.all(promises);
	});

	return {
		// loading state
		pending: readonly(pending),

		// input data
		emptyFuncTree: computed(() => emptyFuncTree.value),
		loadBudgetXlsxFromServer,
		workbook: computed(() => workbook.value),
		downloadXlsxFromClient,
		uploadBudgetXlsxToServer,

		// derived data
		years: readonly(years),
		isModified: readonly(isModified),
		markModified,
	};
});
