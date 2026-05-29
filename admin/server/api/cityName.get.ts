import ExcelJS from 'exceljs';
import path from 'path';
import { CONFIG_FILE, INPUT_DIR } from '../utils/constants';

export default defineEventHandler(async () => {
	try {
		const filePath = path.resolve(useConfig().kokoDir, INPUT_DIR, CONFIG_FILE);
		const wb = new ExcelJS.Workbook();
		await wb.xlsx.readFile(filePath);
		const ws = wb.getWorksheet('config');
		for (const row of ws?.getRows(2, ws.rowCount) || []) {
			if (row.getCell('A').value === 'city') {
				return row.getCell('B').value as string || '';
			}
		}
	} catch {
		// config.xlsx may not exist yet
	}
	return '';
});
