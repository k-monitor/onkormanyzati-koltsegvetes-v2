import type ExcelJS from 'exceljs';

export function cloneSheet(
	wb: ExcelJS.Workbook,
	sourceName: string,
	targetName: string,
	colCountLimit = 0,
) {
	if (wb.getWorksheet(targetName)) return undefined;
	const source = wb.getWorksheet(sourceName);
	if (!source) return undefined;
	const target = wb.addWorksheet(targetName);
	target.model = { ...source.model, name: targetName };
	if (colCountLimit > 0) {
		target.spliceColumns(colCountLimit + 1, target.columnCount - colCountLimit);
	}
	target.properties = { ...source.properties };
	source.eachRow({ includeEmpty: true }, (row, rowNumber) => {
		const targetRow = target.getRow(rowNumber);
		const colCount = colCountLimit > 0 ? colCountLimit : row.cellCount;
		for (let colNumber = 1; colNumber <= colCount; colNumber++) {
			const targetCell = targetRow.getCell(colNumber);
			targetCell.style = row.getCell(colNumber).style;
			targetCell.value = row.getCell(colNumber).value;
		}
		targetRow.commit();
	});
	return target;
}

export function createSheet(
	wb: ExcelJS.Workbook,
	name: string,
	rows: Array<Array<ExcelJS.CellValue>>,
) {
	if (wb.getWorksheet(name)) return undefined;
	const sheet = wb.addWorksheet(name);
	rows.forEach((rowValues, rowIndex) => {
		const row = sheet.getRow(rowIndex + 1);
		rowValues.forEach((cellValue, colIndex) => {
			const cell = row.getCell(colIndex + 1);
			cell.value = cellValue;
		});
		row.commit();
	});
	return sheet;
}

export function deleteSheet(wb: ExcelJS.Workbook, name: string) {
	const sheet = wb.getWorksheet(name);
	if (!sheet) return false;
	wb.removeWorksheet(sheet.id);
	return true;
}

export function renameSheet(wb: ExcelJS.Workbook, oldName: string, newName: string) {
	if (wb.getWorksheet(newName)) return false;
	const sheet = wb.getWorksheet(oldName);
	if (!sheet) return false;
	sheet.name = newName;
	return true;
}

// TODO LATER create, rename: sanitize new name to be valid sheet name, and maybe return actual new name
