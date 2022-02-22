# Önkormányzati költségvetés vizualizáció 2.0+

*KÖKÖ: Közérthető Költségvetés*

Az oldal alapja a [StartBootstrap / Creative](https://github.com/BlackrockDigital/startbootstrap-creative) sablon, illetve az [önkormányzati költségvetés vizualizáció v1.x](https://github.com/k-monitor/onkormanyzati-koltsegvetes-v1).

*Copyright &copy; 2020 DeepData Ltd.*

---



## Beüzemelés

A weboldal a Gridsome keretrendszeren alapul, ami a forrásfájlokból egy optimalizált weboldalt generál.

A beüzemelés lépései:

1. Telepíts Node.js-t és Yarn-t, ezek adják az alapvető környezetet a projekthez.
1. Telepítsd a Gridsome-ot parancssorból: `yarn global add @gridsome/cli`, ez fogja legenerálni a kész weboldalt.
1. A projekt mappájában futtasd le a `yarn install` parancsot, ez letölti a szükséges csomagokat a `node_modules` mappába.
1. Másold be az önkormányzattól kapott XLSX fájlt az `input` mappába, `budget.xlsx` néven.
1. Futtasd le a `yarn new-config` parancsot, ez legenerálja az `input/config.xlsx` fájlt, melynek tartalma részben függ a `budget.xlsx`-től.
1. Töltsd ki a `config.xlsx` fájlt, ez tartalmazza a weboldal beállításait és szövegeit.
1. Ellenőrizd, hogy az alábbiakban bemutatott XLSX fájlok mind jelen vannak-e az `input` mappában, és mindegyiknek megfelelő-e a formátuma.
1. A projekt mappájában futtasd le a `yarn prepare` parancsot, ez az `input` mappában levő fájlokban rejlő adatokat átalakítja a vizualizációnak megfelelő formátumra. A generált adatfájlok az `src/data` mappába kerülnek, a weboldal fejlesztésekor és generálásakor innen lesznek kiolvasva.
1. A projekt mappájában indítsd el a `gridsome develop` parancsot, mely egy lokális webszervert nyit. Ezután a http://localhost:8080/ címen meg tudod tekinteni a weboldal előnézetét. Ahogy módosítod a fájlokat, az előnézet is frissülni fog. A programot a `Ctrl+C` kombinációval lehet leállítani.
1. A weboldal legenerálásához használd a `gridsome build` parancsot. (Ez lefuttatja a `prepare` szkriptet is.) A kész weboldal a `dist` mappába kerül, ennek tartalmát kell a webszervereddel hosztolnod.
1. A kereső naplózás funkciójához szükség van telepített PHP interpreterre is, valamint a következő parancs lefuttatására a hosztolt mappában: `touch search.log && sudo chown www-data:www-data search.log`. A `search.log` fájlt érdemes publikusan elérhetetlenné tenni (ld. `static/.htaccess`). Ha erre a naplózó funkcióra nincs szükség, a `track-search.php` fájlt ajánlott törölni a webszerverről.



## Mappastruktúra

- **dist/ (generált)** - Ebbe a mappába generálja a Gridsome a kész weboldalt.
- **input/** - Ebbe a mappába kell helyezni az input adatokat.
- **scripts/** - Ebben a mappában segédszkriptek vannak.
- **src/** - A weboldal forrásfájljai.
- **static/** - A weboldal statikus fájljai, amik a build folyamat során érintetlenül át lesznek másolva a kimeneti mappába. Ezen belül lehet elhelyezni a képeket és videókat.



## Adatok

A vizualizáció az alábbi adatfájlokból dolgozik:

- **input/budget.xlsx** - A vizualizáció adatainak forrása.
- **input/config.xlsx** - A weboldal beállításai és szövegei.
- **input/tags.xlsx** - A kereső által használt címkehalmazok.
- **src/data/config.js** - A weboldal beállításai, szövegei.
- **src/data/data.json (generált)** - A vizualizáció adatai, előkészítve.
- **src/data/functions.tsv** - A funkcionális kategóriák fa struktúrája.
- **src/data/milestones.json (generált)** - A fejlesztések leírásai, előkészítve.
- **src/data/tags.json (generált)** - A kereső által használt címkehalmazok, előkészítve.
- **src/data/tooltips.json (generált)** - Az egyes kategóriákhoz tartozó tooltip-ek szövegei, előkészítve.


### Markdown formátum

Az alábbiakban bemutatott input fájlokban helyenként támogatott a Markdown formátum használata. Ez azt jelenti, hogy az egyszerű szöveghez hozzáadhatók a Markdown nyelv speciális karakterei és szerkezetei, annak érdekében, hogy a szöveg végül a honlapon formázottan jelenjen meg. A KÖKÖ által támogatott Markdown jelölések és formázások az alábbiak:

Input (Markdown szöveg)                                              | Output (honlapon megjelenő formázott szöveg)
---------------------------------------------------------------------|---------------------------------------------
`A **második** szó félkövér lesz.`                                   | A **második** szó félkövér lesz.
`A _második_ szó dőlt lesz.`                                         | A _második_ szó dőlt lesz.
`Itt egy [linket](https://www.markdowntutorial.com/) helyeztünk el.` | Itt egy [linket](https://www.markdowntutorial.com/) helyeztünk el.
<code>- Ez<br>- egy<br>- lista</code> | <ul><li>Ez</li><li>egy</li><li>lista</li></ul>
<code>1. Ez pedig<br>1. egy számozott<br>1. lista</code> | <ol><li>Ez pedig</li><li>egy számozott</li><li>lista</li></ol>

A listák esetében fontos, hogy az első listaelem előtt és az utolsó listaelem után legyen 1-1 üres sor.



### input/budget.xlsx

Az általános KGR rendszer importja. A munkafüzet több munkalapból állhat, melyek elnevezése a következő alakú lehet: `ÉVSZÁM <TÍPUS>` vagy `ÉVSZÁM_<TÍPUS>`, ahol a `<TÍPUS>` helyén `BEVÉTEL`, `BEVETEL`, `KIADÁS` vagy `KIADAS` állhat (a kis- és nagybetűk nincsenek megkülönböztetve). Az `ÉVSZÁM` tetszőleges szöveg lehet, nem csak számjegyek.

A munkalapoknak 2 formátumát ismeri a program. Az egyik az elmúlt évekre vonatkozik, a másik a prognózisokra. A bevételi és kiadási oldal adott éven belül azonos formátumú. Prognózisok esetében a funkcionális bontást nem tartalmazza az input.



#### Elmúlt évekre vonatkozó formátum

Az ilyen munkalapokon megtalálható a mátrix, vagyis nem csak közgazdasági bontásban vannak az adatok, hanem funkcionális bontásban is. Elvárt formátum:

- 1\. sor: lényegtelen
- 2\. sor: a 4. (D) oszloptól kezdve funkcionális kategóriák `<AZONOSÍTÓSZÁM> <ELNEVEZÉS>` formában. Az elnevezés lényegtelen. A programnak csak az azonosítószám kell, amit szóközzel kell elválasztani a többi adattól, pl.: _"042120 Mezőgazdasági támogatások"_.
- 3\. sortól kezdve:
	- 1\. oszlop: egy legalább kétjegyű számot kell tartalmaznia ahhoz, hogy a program az adott sort adatsornak vegye és feldolgozza, noha e cella értéke nem lesz másra használva (így kézileg hozzáadott soroknál megadható akár `99` is).
	- 2\. oszlop: közgazdasági kategória elnevezése és kiegészítő információi.
		- A cellákban szerepelnie kell a kategória azonosítójának, `(B123)` vagy `(K123)` formában. Ezek az azonosítók egymással hierarchiában vannak: egy `Bx` azonosító gyermekei a `Bx` prefixű, eggyel több számjegyű azonosítók, ÉS a `Bx` azonosítójú, _"ebből:"_ kezdetű kategóriák. Előfordul, hogy a szintek között nem egy, hanem két számjegy különbség van.
		- Az azonosítóknál az `FH` és `FT` prefix is engedélyezett, melyek 1 számjegyes szintje a Mérleg ábrán fog megjelenni, középen, zöld színnel.
		- A cellában opcionálisan szerepelhet egy összegképlet, de ezt a program nem használja, és ki is fogja vágni.
		- Példa: _"Működési célú támogatások államháztartáson belülről (=07+...+10+21+32) (B1)"_
	- 3\. oszlop: az adott közgazdasági kategóriához tartozó összeg
	- 4\. oszloptól kezdve: az adott közgazdasági (sor) és funkcionális (oszlop) kategóriához tartozó számérték.
	- A számértékből beolvasáskor a `,` és szóköz karakterek eltávolításra kerülnek.



#### Prognózisra vonatkozó formátum

Az ilyen munkalapokról hiányzik a funkcionális bontás. A formátum hasonló az előbbiekben leírtakhoz, az alábbi módosításokkal:

- 1.-3. sor: lényegtelen
- a közgazdasági kategóriák bontása a 4. sortól kezdődik



### input/config.xlsx

Ez a fájl írja le a weboldal beállításait és szövegeit. A szerkeszthető oszlopokat sárgás szín jelöli.

Ez a fájl a `budget.xlsx` alapján van generálva, a "tooltips <ÉVSZÁM>" munkalapok az aktuális költségvetésben szereplő kategóriákat tartalmazzák.



#### A "config" munkalap formátuma:

- az 1. sor a fejléc, melynek első 2 eleme kötelezően "key" és "value"
- a 2. sortól kezdve kulcs-érték párok, magyarázattal:
	- 1\. oszlop: kulcs, mely azonosítja a beállítást/szöveget a program számára
	- 2\. oszlop: testreszabható érték, bizonyos esetekben a Markdown formátum támogatott (ez a magyarázatban jelezve van)
	- 3\. oszlop: magyarázat



#### A "tooltips <ÉVSZÁM>" munkalapok formátuma:

- az 1. sor a fejléc, a cellák értéke nincs megkötve
- a 2. sortól kezdve kulcs-érték párok, magyarázattal:
	- 1\. oszlop: funkcionális/közgazdasági kategória azonosító (funkcionális bontásnál egy természetes szám, közgazdasági bontásnál a `B123` vagy a `K123` alakú azonosító)
	- 2\. oszlop: funkcionális/közgazdasági kategória megnevezése
	- 3\. oszlop: testreszabható súgószöveg az adott kategóriához



#### A "milestones" munkalap formátuma:

- az 1. sor a fejléc, melynek oszlopai kötelezően:
	- "nodeId"
	- "year"
	- "imageFile"
	- "videoFile"
	- "title"
	- "descriptionInMarkdown"
- a 2. sortól kezdve a fejlesztések adatai:
	- 1\. oszlop: azon kategória azonosítója, amelyhez ez a fejlesztés tartozik (funkcionális bontásnál egy természetes szám, közgazdasági bontásnál a `B123` vagy a `K123` alakú azonosító)
	- 2\. oszlop: azon év, amelyhez a fejlesztés tartozik
	- 3\. oszlop: a fejlesztéshez tartozó képfájl elérési útvonala vagy URL-je (linkje)
	- 4\. oszlop: a fejlesztséhez tartozó videó (opcionális), ami egy MP4 fájlra kell mutasson
	- 5\. oszlop: a fejlesztés megnevezése, minél rövidebb, annál jobb
	- 6\. oszlop: a fejlesztés rövid leírása, Markdown formátum támogatott



### input/tags.xlsx

A kereső funkciónak 4 címkehalmazra van szüksége:

- bevételi oldal, közgazdasági bontás
- bevételi oldal, funkcionális bontás
- kiadási oldal, közgazdasági bontás
- kiadási oldal, funkcionális bontás

Ezeket az adatokat a `tags.xlsx`-ben, egyetlen munkalapon (az elsőn!) kell megadni, az alábbi szerkezetben:

- az 1. sor opcionálisan lehet fejléc
- további sorok:
	- 1\. oszlop az oldalt jelöli: `expense` (kiadás) vagy `income` (bevétel)
	- 2\. oszlop a bontást jelöli: `econ` (közgazdasági) vagy `func` (funkcionális)
	- 3\. oszlop a kategória azonosítót tartalmazza: funkcionális bontásnál egy természetes szám, közgazdasági bontásnál a `B123` vagy a `K123` alakú azonosítókat használni. A cellában az azonosító után opcionálisan szerepelhet egy szóköz után a kategória elnevezése is a szerkesztést segítendő, de ezt a program nem fogja olvasni.
	- 4\. oszlop tartalmazza a címkéket: vesszővel, és opcionálisan még szóközzel is elválasztott kifejezések



### src/data/functions.tsv

A funkcionális kategóriák fa struktúráját írja le.

Formátuma TSV, oszlopai: kategória azonosító, címke, szülő kategória azonosító.

Ha az utóbbi oszlopba olyan érték kerül, amihez nem tartozik sor, akkor az adott kategória a gyökérben lesz látható.

```tsv
107054	Családsegítés	1070
107014	Támogatott lakhatás hajléktalan személyek részére	1070
900070	Fejezeti és általános tartalékok elszámolása	9000
...
```



### src/data/data.json (generált)

Ezt a fájlt a `budget.xlsx` tartalmából generálja a `prepare-data.js` szkript. Ez a fájl tartalmazza a több éves költségvetési adatokat az alábbi struktúrában:

```json
{
	"<évszám>": {
		"expense": {
			"econ": { ... },
			"func": { ... }
		},
		"income": {
			"econ": { ... },
			"func": { ... }
		}
	},
	...
}
```

Az `expense` mező a kiadások, az `income` a bevételek adatait tartalmazza. Az `econ` a közgazdasági, míg a `func` a funkcionális bontásban írja le az adatokat. Mindkét bontás 1-1 gyökér node-ot tartalmaz. A node-ok struktúrája:

```json
{
	"id": 123,
	"name": "...",
	"value": 12345678,
	"children": [ ... ]
}
```

- **id** - A kategória azonosítója, funkcionális kategória esetén természetes szám, közgazdasági kategóriáknál `B123` vagy `K123` alakú azonosító.
- **name** - A kategória elnevezése.
- **value** - Az adott node-hoz tartozó összeg.
- **children** - Gyerek node-ok tömbje.



### src/data/milestones.json (generált)

Ezt a fájlt a `milestones.xlsx` tartalmából generálja a `prepare-milestones.js` szkript. Ez a fájl tartalmazza a *Fejlesztések* szakasz tartalmát.

Formátuma JSON, struktúra:

```json
{
	"milestones": {
		"fejl-1": {
			"year": 2018,
			"picture": "...",
			"title": "...",
			"description": "...",
			"vid": "..."
		},
		...
	},
	"rels": {
		"2018": {
			"K123": "fejl-1",
			...
		},
		...
	}
}
```

A `milestones` objektumban a kulcsok a fejlesztés azonosítók, az érték pedig egy objektum az alábbi mezőkkel:

- `year`: évszám (amelyikhez a fejlesztés tartozik)
- `picture`: a képfájl elérési útvonala
- `title`: fejléc
- `description`: leírás

A `rels` objektum évekre bontva tartalmazza a kategóriákhoz tartozó fejlesztéseket. A bontásokhoz tartozó objektumban a kulcsok a kategória azonosítók, az értékek a fejlesztés azonosítók.



### src/data/tags.json (generált)

Ezt a fájlt a `tags.xlsx` tartalmából generálja a `prepare-tags.js` szkript. Ez a fájl tartalmazza a 4 címkehalmazt a 2 költségvetési oldalhoz és 2 bontáshoz.

Formátuma hasonló struktúrát követ, mint a `data.json`, csak itt nincsenek évszámok, és node-ok helyett címkehalmazokat ír le.

```json
{
	"expense": {
		"econ": [ "címke1", "címke2", ... ],
		"func": [ ... ]
	},
	"income": {
		"econ": [ ... ],
		"func": [ ... ]
	}
}
```



### src/data/tooltips.json (generált)

Ezt a fájlt a `config.xlsx`-ben levő `tooltips <ÉVSZÁM>` munkalapokból generálja a `prepare-tooltips.js` szkript. Ez a fájl tartalmazza a kategóriákhoz tartozó tooltip-ek szövegeit, évekre bontva.

Formátuma JSON: egyetlen objektum, benne év, ill. kategória azonosító (`B1`, `B2`, `K1`, `K2`, stb.) kulcsokhoz rendelve a tooltip szövegek.

Ha egy kategóriához nem szerepel tooltip szöveg ebben a fájlban, ott nem fog megjelenni a tooltip.

```json
{
	"2020": {
		"B1": "Lorem ipsum for B1",
		"B2": "Lorem ipsum for B2",
		...
	},
	"2020 MÓDOSÍTOTT": {
		...
	},
	...
}
```



## Szövegek és beállítások

Az oldalon megjelenő szövegeket és a SEO beállításokat (amik nem a `data.json`-ból jönnek) az `input/config.xlsx` fájlban lehet szerkeszteni, mely tartalmazza az egyes mezők magyarázatait is.

A képeket (favicon, logók, fejlesztések képei, stb.) az admin felület segítségével lehet egyszerűen cserélni. Az admin felületet az `npm run admin` paranccsal lehet indítani és alapértelmezésként a http://localhost:8081/ címen lesz elérhető, "admin" felhasználónévvel és "admin" jelszóval.


## Keresési napló

Az oldalon található kereső naplózza a beírt keresőkifejezéseket és a találatok számát. Mindezt a `search.log` fájlba menti ki, melynek formátuma TSV, oszlopai:

- előfordulások száma (hányszor szerepelt az alábbi keresőkifejezés az alábbi találatszámmal)
- keresőkifejezés
- találatok száma


## Admin felület beüzemelése

Magának a költségvetés site-nak a beüzemelése ezekből a fázisokból áll (ez van fentebb részletesebben):

1. A forráskódban cserélni/módosítani kell az Excel és képfájlokat.
2. Le kell generálni a site-ot a forráskódból (`npm run build`).
3. Ezután a `dist` mappában egy statikus weboldal fájljai lesznek, ezt lehet egy webszerverrel (pl. Apache, Nginx) hosztolni.

Az admin modul eme 3 lépés megkönnyítésére szolgál. Ez egy webalkalmazás, ami a forráskód mappájában fut, így le tudja cserélni a fájlokat, és meg tudja hívni az `npm run build` parancsot. Mindezen műveletekhez pedig egy webes felületet biztosít.

Admin beüzemelés lépései részletesen:

1. Telepíts Node.js-t és Yarn-t, ezek adják az alapvető környezetet a projekthez.
2. A projekt mappájában futtasd le a `yarn install` parancsot, ez letölti a szükséges csomagokat a `node_modules` mappába.
3. Készíts másolatot az `.env.example` fájlról `.env` néven.
4. Szerkeszd az `.env` fájlt, hogy beállítsd az admin felületet:
	- `ADMIN_PORT=8081` - a port száma, amin a webes felület elérhető lesz
	- `ADMIN_USER=admin` - ezzel a felhasználónévvel lehet majd elérni az admin felületet
	- `ADMIN_PASS=admin` - ezzel a jelszóval lehet majd elérni az admin felületet
	- `PUBLIC_URL=https://pelda.koltsegvetes.hu/` - az admin felület jobb felső sarkában levő zöld gomb ide fog linkelni
	- `DEPLOY_CMD=` - itt lehet megadni azt a parancsot, ami a `dist` mappát (vagyis a legenerált költségvetés site-ot) a webszerverre kiteszi (pl. ez lehet akár másolás, feltöltés, de akár lehet üresen is hagyni, ha a költségvetést ugyanazon a gépen levő webszerverrel hosztolod és erre a mappára állítottad be a root-ot)
5. Az admin felület az `npm run admin` paranccsal indítható el, és böngészőben pl. a http://localhost:8081/ címen lesz elérhető.

Ahhoz, hogy az admin felület publikusan is elérhető legyen, az alábbiakra van szükség:

1. Állíts be egy domain nevet (pl. admin.pelda.koltsegvetes.hu) úgy, hogy arra a szerverre mutasson, ahol az admin fut.
2. Telepíts és indíts el egy webszervert (pl. Apache vagy Nginx) ugyanazon a gépen.
3. Állítsd be a webszervert úgy, hogy kiszolgálja az 1. pontban beállított domain nevet, és proxy-zza a kéréseket az admin felület portjára.

Apache példa konfig:

```
<VirtualHost *:80>
        ServerAdmin elek@teszt.hu
        ServerName admin.pelda.koltsegvetes.hu
        ProxyPass / http://localhost:8081/
        ProxyPassReverse / http://localhost:8081/
</VirtualHost>
```

Nginx példa konfig:

```
server {
    listen          80;
    server_name     admin.pelda.koltsegvetes.hu;
    location / {
        proxy_redirect                      off;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_read_timeout          1m;
        proxy_connect_timeout       1m;
        proxy_pass                          http://127.0.0.1:8081;
    }
}
```
