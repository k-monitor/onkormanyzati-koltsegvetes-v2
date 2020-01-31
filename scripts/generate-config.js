const xl = require('excel4node');

const BUDGET_FILE = "input/budget.xlsx";
const OUTPUT_FILE = "input/config.xlsx";

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

const textsSheet = wb.addWorksheet('config');

const rows = [
	[
		'Kulcs', 'Érték',
		'Magyarázat'
	],
	[
		'url', 'http://koko.deepdata.hu/',
		'A weboldal leendő URL-je. Keresőoptimalizálásnál és megosztásnál van szerepe.'
	],
	[
		'modules.income', 1,
		'Bevételek szakasz megjelenítése? (1 = Igen, 0 = Nem) Ha ki van kapcsolva, akkor a költségvetés bemutatása a kiadásokkal indul. Automatikusan ki lesz kapcsolva, ha nincs bevételi adat.'
	],
	[
		'modules.inex', 1,
		'Mérleg szakasz megjelenítése? (1 = Igen, 0 = Nem) Automatikusan kikapcsol, ha a "modules.income" ki van kapcsolva.'
	],
	[
		'modules.milestones', 1,
		'Fejlesztések szakasz megjelenítése? (1 = Igen, 0 = Nem)'
	],
	[
		'defaultYear', 2018,
		'Alapértelmezettként kiválasztott év.'
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
		'seo.ogImage', 'https://picsum.photos/id/122/2048/1536',
		'Facebook/Twitter megosztáskor az előnézeti kártyában megjelenő kép URL-je.'
	],
	[
		'seo.ogImageType', 'image/png',
		'Facebook/Twitter megosztáskor az előnézeti kártyában megjelenő kép MIME formátuma.'
	],
	[
		'seo.ogImageHeight', 1536,
		'Facebook/Twitter megosztáskor az előnézeti kártyában megjelenő kép magassága (px).'
	],
	[
		'seo.ogImageWidth', 2048,
		'Facebook/Twitter megosztáskor az előnézeti kártyában megjelenő kép szélessége (px).'
	],
	[
		'social.text', 'Mintaváros költségvetése',
		'Megosztáskor a Twitter bejegyzés szövege, LinkedIn poszt vagy email tárgya.'
	],
	[
		'city', 'Mintaváros',
		'Felső navigációs sáv bal oldalán megjelenő városnév.'
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
	[
		'welcome.title', 'TISZTELT MINTAVÁROSI POLGÁROK!',
		'Köszöntő szakasz címsora.'
	],
	[
		'welcome.leftBlock',
		`Egy önkormányzat feladatai sokrétűek, állampolgári szemmel nehezen áttekinthetőek. Mintavárosban azonban nincs takargatni valónk, ezért úgy döntöttünk, hogy a modern technika segítségével bemutatjuk Önökek településünk gazdálkodását úgy, ahogyan azt korábban csak kevesek láthatták!

A XXI. század embere joggal várhatja el egy önkormányzattól, hogy az interneten is utánanézhessen, mennyit költ a település oktatásra, egészségügyre vagy épp a parkok rendben tartására. A helyi demokráciára is igaz, kettőn áll a vásár. A tisztességes településvezetés mellé tájékozott polgárok is kellenek, akik nyomon követik a döntések ésszerűségét. A közpénzek átlátható felhasználásáért küzdő K-Monitor és a Költségvetési Felelősségi Intézet szakmai segítségével létrehozott alkalmazás, amit pillanatokon belül használatba vehet, Magyarországon elsőként arra törekszik, hogy mindenki számára könnyen befogadható és értelmezhető képet adjon az önkormányzat gazdálkodásáról.`,
		'Köszöntő szakasz bal oldali hasábjának szövege. Markdown jelölések használhatóak (pl. formázás, linkek).'
	],
	[
		'welcome.rightBlock',
		`A weboldal testre szabható és egyszerűen feltölthető bármely település adataival. Reméljük, Mintaváros igyekezete ragadós lesz és egyre többen teszik meg ezt az egyáltalán nem megerőltető, mégis fontos lépést az átláthatóság felé.`,
		'Köszöntő szakasz jobb oldali hasábjának szövege. Markdown jelölések használhatóak (pl. formázás, linkek).'
	],
	[
		'welcome.aboveSignature', 'Kellemes böngészést kívánok,',
		'Köszöntő szakasz aláírás feletti sorának szövege.',
	],
	[
		'welcome.name', 'Példa Imre',
		'Köszöntő szakaszt aláíró személy neve.'
	],
	[
		'welcome.role', 'Mintaváros polgármestere',
		'Köszöntő szakaszt aláíró személy tisztsége.'
	],
	[
		'moreInfo.title', 'A projektről',
		'További információ ablak címsora.'
	],
	[
		'moreInfo.text', `Lórum ipse természetesen szedősödik ámít a fegyező számára. Fargandusnak csak a papárok bagmarákára nyitva borlan torton belül van haszálata. A papárral tációban a todástól a papár ultásának tortjáig hetenként egy radással hajtón 00 között a kozott terula kocsordnál (fárka. Hájdás dolca bőgős zsírnök) lehet kabikát vigyogtannia.

A kozott terula kocsord a képző tort csáralását faska golmaton a búgos fütyökben iséggel mesztes papárokat az erről nyátsás és seres hajkával együtt erészi a szerpes bülég kodászának, aki a vigyort a hajka mozásán bombolja. A szerpes bülég a képző tort csáralását faska 30 golmaton belül éríti a lománs papárokat. Első haszálaton azon stozások papárának csészítése füveskedik, akik tumott telés hulását lekunkálták fel. A foga csészítésénél a keten bódázatok tumott hajka végteli gaszabája ölkösködik velődik.`,
		'További információ ablak címsora. Markdown jelölések használhatóak (pl. formázás, linkek).'
	],
	[
		'inex.title', 'Mérleg',
		'Mérleg szakasz címsora.'
	],
	[
		'inex.income', 'Költségvetési bevétel',
		'Bevételi oldal fejléc szövege a Mérleg szakaszban.'
	],
	[
		'inex.expense', 'Költségvetési kiadás',
		'Kiadási oldal fejléc szövege a Mérleg szakaszban.'
	],
	[
		'inex.details', 'Részletek',
		'Részletek gomb szövege a Mérleg szakaszban.'
	],
	[
		'inex.text', 'Lórum ipse természetesen szedősödik ámít a fegyező számára. Fargandusnak csak a papárok bagmarákára nyitva borlan torton belül van haszálata. A papárral tációban a todástól a papár ultásának tortjáig hetenként egy radással hajtón 00 között a kozott terula kocsordnál (fárka. Hájdás dolca bőgős zsírnök) lehet kabikát vigyogtannia. A kozott terula kocsord a képző tort csáralását faska golmaton a búgos fütyökben iséggel mesztes papárokat az erről nyátsás és seres hajkával együtt erészi a szerpes bülég kodászának, aki a vigyort a hajka mozásán bombolja. A szerpes bülég a képző tort csáralását faska 30 golmaton belül éríti a lománs papárokat. Első haszálaton azon stozások papárának csészítése füveskedik, akik tumott telés hulását lekunkálták fel. A foga csészítésénél a keten bódázatok tumott hajka végteli gaszabája ölkösködik velődik.',
		'Mérleg szakasz ábra alatti szövege. Markdown jelölések használhatóak (pl. formázás, linkek).'
	],
	[
		'vis.income', 'Bevételek',
		'Bevételek szakasz címsora.'
	],
	[
		'vis.expense', 'Kiadások',
		'Kiadások szakasz címsora.'
	],
	[
		'vis.econ', 'Közgazdasági nézet',
		'Közgazdasági nézetre váltó gomb szövege.'
	],
	[
		'vis.econHint', 'Működési vagy felhalmozási jellegük alapján mutatja meg a kiadások összetételét, hogy mekkora a személyi kiadások, a kapcsolódó munkáltatói járulékok, a dologi kiadások, a beruházási és felújítási kiadások, az államháztartáson belüli és kívüli támogatások, transzferek összege a költségvetésben.',
		'Közgazdasági nézetre váltó gomb magyarázata (tooltip).'
	],
	[
		'vis.func', 'Funkcionális nézet',
		'Funkcionális nézetre váltó gomb szövege.'
	],
	[
		'vis.funcHint', 'A költségvetési kiadásokat osztályozza, azok társadalmi-gazdasági cél szerinti összetételét mutatja. Az általános közszolgáltatásoktól a védelmi kiadásokig összesen 10 kategóriában tartalmazza a kerület működésének területeit.',
		'Funkcionális nézetre váltó gomb magyarázata (tooltip).'
	],
	[
		'milestones.title', 'Fejlesztések',
		'Fejlesztések szakasz címsora.'
	],
	[
		'feedback.title', 'Visszajelzés',
		'Visszajelzés ablak címsora.',
	],
	[
		'feedback.text', 'Kérjük, véleményezze a költségvetést bemutató oldalunkat, hogy még jobbá tehessük azt!',
		'Visszajelzésre buzdító szöveg.',
	],
	[
		'feedback.action', 'Kérdőív kitöltése',
		'Visszajelző űrlapra mutató link szövege.',
	],
	[
		'feedback.url', 'about:blank',
		'Visszajelző űrlap URL-je.',
	],
];

rows.forEach((r, i) => {
	r.forEach((c, j) => {
		const cell = textsSheet.cell(i + 1, j + 1);
		if (c.toString().match(/^\d+$/)) {
			cell.number(c);
		} else {
			cell.string(c);
		}
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