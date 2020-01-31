const xl = require('excel4node');

const BUDGET_FILE = "input/budget.xlsx";
const OUTPUT_FILE = "input/texts-template.xlsx";

const wb = new xl.Workbook();

const blue = '#00396C';
const yellow = '#FFE7A4';

const headerStyle = wb.createStyle({
	fill: {
		bgColor: blue,
		fgColor: blue,
		patternType: 'solid',
		type: 'pattern'
	},
	font: {
		bold: true,
		color: '#FFFFFF'
	}
});

const keyStyle = wb.createStyle({
	font: {
		color: '#999999',
		italics: true
	}
});

const inputStyle = wb.createStyle({
	fill: {
		bgColor: yellow,
		fgColor: yellow,
		patternType: 'solid',
		type: 'pattern'
	},
	font: {
		color: blue
	}
});

const textsSheet = wb.addWorksheet('Szövegek');

const rows = [
	[
		'Kulcs', 'Érték',
		'Magyarázat'
	],
	[
		'seo.siteName', 'Mintaváros',
		'Böngészőablak címsorának 2. része. A teljes címsor max. 60 karakter lehet.'
	],
	[
		'seo.pageTitle', 'Költségvetés',
		'Böngészőablak címsorának 2. része. A teljes címsor max. 60 karakter lehet.'
	],
	[
		'seo.ogTitle', 'MINTAVÁROS KÖLTSÉGVETÉSE',
		'Facebook/Twitter megosztáskor az előnézeti kártya címsora.'
	],
	[
		'seo.description', 'Mintaváros költségvetése könnyen befogadható és értelmezhető módon, ahol néhány kattintással mindenki láthatja, miből, mennyit és mire költünk.',
		'Google találatban, ill. Facebook/Twitter megosztáskor az előnézeti kártyában megjelenő leírás. Max. 160 karakter.'
	],
	[
		'social.text', 'Mintaváros költségvetése',
		'Megosztáskor a Twitter bejegyzés szövege, LinkedIn poszt vagy email tárgya.'
	],
	[
		'navBar.welcome', 'Köszöntő',
		'Köszöntő szakaszra mutató link szövege a felső navigációs sávban.'
	],
	[
		'navBar.inex', 'Költségvetés',
		'Költségvetés szakaszra mutató link szövege a felső navigációs sávban.'
	],
	[
		'navBar.milestones', 'Fejlesztések',
		'Fejlesztések szakaszra mutató link szövege a felső navigációs sávban.'
	],
	[
		'navBar.moreInfo', 'A projektről',
		'További információ ablakot előhívó link szövege a felső navigációs sávban.'
	],
	[
		'search.tooShort', 'Túl rövid keresőkifejezés!',
		'Kereséskor megjelenő szöveg, ha túl rövid a keresőkifejezés.'
	],
	[
		'search.noResults', 'Nincs találat.',
		'Kereséskor megjelenő szöveg, ha nincs találat.'
	],
	[
		'search.income', 'Bevételek',
		'Keresési találatban megjelenő link szövege, mely a Bevételek szakaszra mutat.'
	],
	[
		'search.expense', 'Kiadások',
		'Keresési találatban megjelenő link szövege, mely a Kiadások szakaszra mutat.'
	],
	[
		'search.econ', 'közgazdasági kategória',
		'Keresési találatban megjelenő szöveg, ha az adott találat egy közgazdasági kategória.'
	],
	[
		'search.func', 'funkcionális kategória',
		'Keresési találatban megjelenő szöveg, ha az adott találat egy funkcionális kategória.'
	],
	[
		'header.title', 'Mintaváros költségvetése',
		'Fejléc szakaszban megjelenő főcím.'
	],
	[
		'header.headline', 'Ezen az oldalon megtekintheted Mintaváros költségvetését és fejlesztéseit, átlátható módon, interaktív vizualizációk segítségével!',
		'Fejléc szakaszban megjelenő headline.'
	],
	[
		'header.button', 'Tovább',
		'Fejléc szakaszban megjelenő Tovább gomb szövege.'
	],
];

rows.forEach((r, i) => {
	r.forEach((c, j) => {
		const cell = textsSheet.cell(i + 1, j + 1).string(c);
		if (i === 0) {
			cell.style(headerStyle);
		} else if (j === 1) {
			cell.style(inputStyle);
		} else if (j === 0) {
			cell.style(keyStyle);
		}
	});
});
textsSheet.column(1).setWidth(25);
textsSheet.column(2).setWidth(40);
textsSheet.column(3).setWidth(100);
textsSheet.row(1).freeze();

wb.write(OUTPUT_FILE);