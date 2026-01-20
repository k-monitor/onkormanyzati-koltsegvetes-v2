import ExcelJS from 'exceljs';

export async function readXLSX(file: string) {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.readFile(file);
	return wb;
}

export async function writeXLSX(wb: ExcelJS.Workbook, file: string) {
	await wb.xlsx.writeFile(file);
}

export function deleteSheet(wb: ExcelJS.Workbook, name: string) {
	// TODO LATER return boolean indicating success/failure

	const sheet = wb.getWorksheet(name);
	if (!sheet) return;
	wb.removeWorksheet(sheet.id);
}

export function renameSheet(wb: ExcelJS.Workbook, oldName: string, newName: string) {
	// TODO LATER return boolean indicating success/failure
	// TODO LATER sanitize new name to be valid sheet name, and maybe return actual new name

	if (wb.getWorksheet(newName)) return;
	const sheet = wb.getWorksheet(oldName);
	if (!sheet) return;
	sheet.name = newName;
}
