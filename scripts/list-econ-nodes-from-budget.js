/*
	Budakalász 2019-es prognózisában a finanszírozási kategóriák természetes szám azonosítóival gond van.
	Duplikációk vannak, illetve nem azok az ID-k vannak a kategóriáknál, amik a képletekben vannak.

	Ez a szkript segít nekem ellenőrizni, hogy a közgazdasági kategóriák minden évben ugyanazok-e.

	Kilistázza az ALTID, ID, YEAR, NAME oszlopokat, rendezve.
*/

const fs = require('fs');
const xlsx = require('xlsx');

const INPUT_FILE = './input/budget.xlsx';
const OUTPUT_FILE = 'temp.tsv';

const outputLines = [];
const workbook = xlsx.readFile(INPUT_FILE);
workbook.SheetNames.forEach(sheetName => {
	console.log('Processing sheet:', sheetName);
	const matrixTsv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' });

	matrixTsv.split('\n')
		.splice(2)
		.filter(row => row.match(/^\d{2,}/))
		.forEach(row => {
			let [id, descriptor, value] = row.split('\t');
			id = Number(id);
			value = Number(value.replace(/\D+/g, ''));
			const { name, altId } = parseEconomicDescriptorLite(descriptor);
			if (!descriptor.startsWith('ebből:')) {
				outputLines.push([
					altId,
					//id,
					sheetName.split(/[ _]/)[0],
					//name,
					descriptor
				].join('\t'));
			}
		});
});
fs.writeFileSync(OUTPUT_FILE, outputLines.sort().join('\n'));

function parseEconomicDescriptorLite(descriptor) {
	let altId, name, m;

	if ((m = descriptor.match(/ \(([BK0-9\-]+)\)$/))) {
		altId = m[1];
	}

	name = descriptor.replace(/ +\(?\(?[>=+….\) \(BK0-9\-]+\)$/, '');

	return { altId, name };
}