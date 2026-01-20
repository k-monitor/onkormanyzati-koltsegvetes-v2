import XLSX from 'xlsx';

export function readXLSX(file: string) {
	return XLSX.readFile(file);
}

export function writeXLSX(wb: XLSX.WorkBook, file: string) {
	XLSX.writeFile(wb, file);
}

export function deleteSheet(wb: XLSX.WorkBook, name: string) {
	// TODO LATER return boolean indicating success/failure

	const sheet = wb.Sheets[name];
	if (!sheet) return;
	delete wb.Sheets[name];

	const index = wb.SheetNames.indexOf(name);
	if (index === -1) return;
	wb.SheetNames.splice(index, 1);
}

export function renameSheet(wb: XLSX.WorkBook, oldName: string, newName: string) {
	// TODO LATER return boolean indicating success/failure
	// TODO LATER sanitize new name to be valid sheet name, and maybe return actual new name

	if (wb.Sheets[newName] || wb.SheetNames.includes(newName)) return;

	const sheet = wb.Sheets[oldName];
	if (!sheet) return;
	wb.Sheets[newName] = sheet;
	delete wb.Sheets[oldName];

	const index = wb.SheetNames.indexOf(oldName);
	if (index === -1) return;
	wb.SheetNames[index] = newName;
}
