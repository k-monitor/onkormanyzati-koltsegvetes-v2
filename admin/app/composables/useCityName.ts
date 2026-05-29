import ExcelJS from 'exceljs';

export default createGlobalState(async () => {
	async function loadConfigXlsxFromServer() {
		try {
			const buffer = await $fetch<ArrayBuffer>('/input/config.xlsx', {
				responseType: 'arrayBuffer',
			});
			const wb = new ExcelJS.Workbook();
			await wb.xlsx.load(buffer);
			return wb;
		} catch (error) {
			console.error('Error loading config.xlsx from server:', error);
		}
	}

	const cityName = ref('');

	onBeforeMount(async () => {
		const wb = await loadConfigXlsxFromServer();
		const ws = wb?.getWorksheet('config');
		for (const row of ws?.getRows(2, ws.rowCount) || []) {
			if (row.getCell('A').value === 'city') {
				cityName.value = row.getCell('B').value as string;
				break;
			}
		}
	});

	return readonly(cityName);
});
