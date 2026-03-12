import type ExcelJS from 'exceljs';

export function cloneSheet(wb: ExcelJS.Workbook, sourceName: string, targetName: string) {
	if (wb.getWorksheet(targetName)) return false;
	const source = wb.getWorksheet(sourceName);
	if (!source) return false;
	const target = wb.addWorksheet(targetName);
	target.model = { ...source.model, name: targetName };
	target.properties = { ...source.properties };
	source.eachRow({ includeEmpty: true }, (row, rowNumber) => {
		const targetRow = target.getRow(rowNumber);
		row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			const targetCell = targetRow.getCell(colNumber);
			targetCell.style = cell.style;
			targetCell.value = cell.value;
		});
		targetRow.commit();
	});
	return true;
}

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
