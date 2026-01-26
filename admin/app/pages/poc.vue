<script setup lang="ts">
// FIXME delete this page when all functionality is adopted elsewhere

import ExcelJS from 'exceljs';

const wb = ref<ExcelJS.Workbook | null>(null);

async function loadBudgetXlsxFromServer() {
	const response = await fetch('/input/budget.xlsx');
	const arrayBuffer = await response.arrayBuffer();
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(arrayBuffer);
	console.log('Workbook loaded, sheets:');
	workbook.eachSheet((sheet, id) => {
		console.log(`- ${sheet.name}`);
	});
	return workbook;
}

async function modify(wb: ExcelJS.Workbook) {
	const sheet = '2020 BEVÉTEL';
	const cell = 'A1';
	const newValue = 'Modified Value';
	const worksheet = wb.getWorksheet(sheet);
	if (worksheet) {
		const targetCell = worksheet.getCell(cell);
		targetCell.value = newValue;
	} else {
		console.warn(`Sheet "${sheet}" not found in workbook.`);
	}
}

async function downloadXlsxFromClient() {
	// This function is called from the browser. It should trigger a download of the modified workbook.
	if (!wb.value) {
		console.error('Workbook is not loaded.');
		return;
	}
	const buffer = await wb.value.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'modified_budget.xlsx';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

async function uploadXlsxFromClient() {
	if (!wb.value) {
		console.error('Workbook is not loaded.');
		return;
	}
	// Upload workbook in wb.value to the server.
	// Endpoint: POST /api/budget
	// It expects a multipart/form-data with the file field named 'budget'.
	const buffer = await wb.value.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const formData = new FormData();
	formData.append('budget', blob, 'modified_budget.xlsx');
	const response = await fetch('/api/budget', {
		method: 'POST',
		body: formData,
	});
	if (response.ok) {
		console.log('Workbook uploaded successfully.');
	} else {
		console.error('Failed to upload workbook.');
	}
}

onMounted(async () => {
	wb.value = await loadBudgetXlsxFromServer();
	if (wb.value) {
		await modify(wb.value);
	}
});
</script>

<template>
	<PageFrame title="PoC: ExcelJS on client">
		<PageSection>
			<template #actions>
				<Button @click="downloadXlsxFromClient">Download</Button>
				<Button @click="uploadXlsxFromClient">Upload</Button>
			</template>
		</PageSection>
	</PageFrame>
</template>
