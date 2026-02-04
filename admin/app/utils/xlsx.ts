import type ExcelJS from 'exceljs';

export function deleteSheet(wb: ExcelJS.Workbook, name: string) {
	const sheet = wb.getWorksheet(name);
	if (!sheet) return false;
	wb.removeWorksheet(sheet.id);
	return true;
}

export function renameSheet(wb: ExcelJS.Workbook, oldName: string, newName: string) {
	// TODO LATER sanitize new name to be valid sheet name, and maybe return actual new name

	if (wb.getWorksheet(newName)) return false;
	const sheet = wb.getWorksheet(oldName);
	if (!sheet) return false;
	sheet.name = newName;
	return true;
}
