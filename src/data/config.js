const configJson = require('./config.json');

// Settings

const url = 'http://koko.deepdata.hu/';
const city = 'Mintaváros';
const defaultYear = 2018;
const modules = {
	income: true,
	inex: true,
	milestones: true
};

const seo = {
	ogImage: 'https://picsum.photos/id/122/2048/1536',
	ogImageType: 'image/png',
	ogImageHeight: 1536,
	ogImageWidth: 2048
};

const welcome = {
	title: 'TISZTELT MINTAVÁROSI POLGÁROK!',
	leftBlock: /* Markdown supported */ `
Egy önkormányzat feladatai sokrétűek, állampolgári szemmel nehezen áttekinthetőek. Mintavárosban azonban nincs takargatni valónk, ezért úgy döntöttünk, hogy a modern technika segítségével bemutatjuk Önökek településünk gazdálkodását úgy, ahogyan azt korábban csak kevesek láthatták!

A XXI. század embere joggal várhatja el egy önkormányzattól, hogy az interneten is utánanézhessen, mennyit költ a település oktatásra, egészségügyre vagy épp a parkok rendben tartására. A helyi demokráciára is igaz, kettőn áll a vásár. A tisztességes településvezetés mellé tájékozott polgárok is kellenek, akik nyomon követik a döntések ésszerűségét. A közpénzek átlátható felhasználásáért küzdő K-Monitor és a Költségvetési Felelősségi Intézet szakmai segítségével létrehozott alkalmazás, amit pillanatokon belül használatba vehet, Magyarországon elsőként arra törekszik, hogy mindenki számára könnyen befogadható és értelmezhető képet adjon az önkormányzat gazdálkodásáról.`,
	rightBlock: /* Markdown supported */ `
A weboldal testre szabható és egyszerűen feltölthető bármely település adataival. Reméljük, Mintaváros igyekezete ragadós lesz és egyre többen teszik meg ezt az egyáltalán nem megerőltető, mégis fontos lépést az átláthatóság felé.`,
	aboveSignature: 'Kellemes böngészést kívánok,',
	name: 'Példa Imre',
	role: `${city} polgármestere`
};

const moreInfo = {
	title: 'A projektről',
	text: /* Markdown supported */ `
Lórum ipse természetesen szedősödik ámít a fegyező számára. Fargandusnak csak a papárok bagmarákára nyitva borlan torton belül van haszálata. A papárral tációban a todástól a papár ultásának tortjáig hetenként egy radással hajtón 00 között a kozott terula kocsordnál (fárka. Hájdás dolca bőgős zsírnök) lehet kabikát vigyogtannia.

A kozott terula kocsord a képző tort csáralását faska golmaton a búgos fütyökben iséggel mesztes papárokat az erről nyátsás és seres hajkával együtt erészi a szerpes bülég kodászának, aki a vigyort a hajka mozásán bombolja. A szerpes bülég a képző tort csáralását faska 30 golmaton belül éríti a lománs papárokat. Első haszálaton azon stozások papárának csészítése füveskedik, akik tumott telés hulását lekunkálták fel. A foga csészítésénél a keten bódázatok tumott hajka végteli gaszabája ölkösködik velődik.`
};

const inex = {
	title: 'Mérleg',
	income: 'Költségvetési bevétel',
	expense: 'Költségvetési kiadás',
	details: 'Részletek',
	text: /* Markdown supported */ 'Lórum ipse természetesen szedősödik ámít a fegyező számára. Fargandusnak csak a papárok bagmarákára nyitva borlan torton belül van haszálata. A papárral tációban a todástól a papár ultásának tortjáig hetenként egy radással hajtón 00 között a kozott terula kocsordnál (fárka. Hájdás dolca bőgős zsírnök) lehet kabikát vigyogtannia. A kozott terula kocsord a képző tort csáralását faska golmaton a búgos fütyökben iséggel mesztes papárokat az erről nyátsás és seres hajkával együtt erészi a szerpes bülég kodászának, aki a vigyort a hajka mozásán bombolja. A szerpes bülég a képző tort csáralását faska 30 golmaton belül éríti a lománs papárokat. Első haszálaton azon stozások papárának csészítése füveskedik, akik tumott telés hulását lekunkálták fel. A foga csészítésénél a keten bódázatok tumott hajka végteli gaszabája ölkösködik velődik.'
};

const vis = {
	income: 'Bevételek',
	expense: 'Kiadások',
	econ: 'Közgazdasági nézet',
	econHint: 'Működési vagy felhalmozási jellegük alapján mutatja meg a kiadások összetételét, hogy mekkora a személyi kiadások, a kapcsolódó munkáltatói járulékok, a dologi kiadások, a beruházási és felújítási kiadások, az államháztartáson belüli és kívüli támogatások, transzferek összege a költségvetésben.',
	func: 'Funkcionális nézet',
	funcHint: 'A költségvetési kiadásokat osztályozza, azok társadalmi-gazdasági cél szerinti összetételét mutatja. Az általános közszolgáltatásoktól a védelmi kiadásokig összesen 10 kategóriában tartalmazza a kerület működésének területeit.'
};

const milestones = {
	title: 'Fejlesztések'
};

const feedback = {
	title: 'Visszajelzés',
	text: 'Kérjük, véleményezze a költségvetést bemutató oldalunkat, hogy még jobbá tehessük azt!',
	action: 'Kérdőív kitöltése',
	url: 'about:blank'
}

// ---

module.exports = Object.assign({
	city,
	defaultYear,
	feedback,
	header,
	inex,
	milestones,
	modules,
	moreInfo,
	navBar,
	search,
	seo,
	social,
	url,
	vis,
	welcome
}, configJson);
