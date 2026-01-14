import XLSX from 'xlsx';

export function readXLSX(file: string) {
	return XLSX.readFile(file);
}

export function writeXLSX(wb: XLSX.WorkBook, file: string) {
	XLSX.writeFile(wb, file);
}

export function renameSheet(wb: XLSX.WorkBook, oldName: string, newName: string) {
	// FIXME check if new name already exists
	// FIXME sanitize new name to be valid sheet name

	const sheet = wb.Sheets[oldName];
	if (!sheet) return;
	wb.Sheets[newName] = sheet;
	delete wb.Sheets[oldName];

	const index = wb.SheetNames.indexOf(oldName);
	if (index === -1) return;
	wb.SheetNames[index] = newName;
}
