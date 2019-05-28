# Önkormányzati költségvetés vizualizáció 2.0+

Az oldal alapja a StartBootstrap / Creative sablon.



## Adatok

A vizualizáció az alábbi adatfájlokból dolgozik:

- `data/functions.tsv`: a funkcionális kategóriák fa struktúrája
- `data/milestones.tsv`: a fejlesztések leírásai
- `data/tooltips.tsv`: az egyes kategóriákhoz tartozó tooltip-ek szövegei
- `data/<évszám>/expense-econ.json`: adott év kiadásai, közgazdasági bontásban, fa struktúrába rendezve
- `data/<évszám>/expense-func.json`: adott év kiadásai, funkcionális bontásban, fa struktúrába rendezve
- `data/<évszám>/income-econ.json`: adott év bevételei, közgazdasági bontásban, fa struktúrába rendezve
- `data/<évszám>/income-func.json`: adott év bevételei, funkcionális bontásban, fa struktúrába rendezve

Az első 3 fájl szerepel a repóban, míg a többi **legenerálható az általános KGR rendszer importjából,** ami egy XLSX (Excel) fájl. Ezt a fájlt ajánlott a `data/src/` könyvtárba helyezni, majd a JSON fájlokat az alábbi paranccsal lehet elkészíteni:

```
node scripts/prepare-data data/src/input_fajl.xslx
```



### Excel fájl formátuma

A munkafüzet több munkalapból állhat, melyek elnevezése a következő lehet: `ÉVSZÁM <TÍPUS>`, ahol a `<TÍPUS>` lehet `BEVÉTEL` vagy `KIADÁS`.

A program ezeket a neveket átalakítja fájlnevekké a következő módon:

```
Munkalapok:         Fájlok:

2018 BEVÉTEL   ->   data/2018/income-econ.json   +  data/2018/income-func.json
2018 KIADÁS    ->   data/2018/expense-econ.json  +  data/2018/expense-func.json
2019 BEVÉTEL   ->   data/2019/income-econ.json
2019 KIADÁS    ->   data/2019/expense-econ.json
```

A program minden munkafüzethez le fog generálni 2-2 JSON fájlt, melyek a közgazdasági és funkcionális bontásban fogják tárolni az összegeket.

A munkalapoknak 2 formátumát ismeri a program. Az egyik az elmúlt évekre vonatkozik, a másik a prognózisokra. A bevételi és kiadási oldal adott éven belül azonos formátumú. Prognózisok esetében a funkcionális bontást nem tartalmazza az input.



#### Elmúlt évekre vonatkozó formátum

Az ilyen munkalapokon megtalálható a mátrix, vagyis nem csak közgazdasági bontásban vannak az adatok, hanem funkcionális bontásban is. Elvárt formátum:

- 1. sor: lényegtelen
- 2. sor: a 4. (D) oszloptól kezdve funkcionális kategóriák `<AZONOSÍTÓSZÁM> <ELNEVEZÉS>` formában. Az elnevezés lényegtelen. A programnak csak az azonosítószám kell, amit szóközzel kell elválasztani a többi adattól, pl.: *"042120 Mezőgazdasági támogatások"*.
- 3. sortól kezdve:
	- 1. oszlop: közgazdasági kategória azonosítószáma, legalább kétjegyű, pl.: `01`
	- 2. oszlop: közgazdasági kategória elnevezése és kiegészítő információi.
		- A cellák végén `(B123)` vagy `(K123)` formában alternatív azonosító szerepelhet, de ezt a program nem használja.
		- Az elnevezés után opcionálisan szerepelhet egy formula, mely azt mondja meg, hogy az adott sor mely más kategóriákat összegzi. Ennek a formulának zárójelben kell lennie és szóközzel kell elválasztani az elnevezéstől. A formula csak számokat és `+` jelet tartalmazhat. A nyitó zárójel után opcionálisan szerepelhet valamennyi `=` vagy `>` karakter. Intervallum jelölésére használható `.` vagy `…`, 2 `+` jel között.
		- Példa: *"Működési célú támogatások államháztartáson belülről (=07+...+10+21+32) (B1)"*
	- 3. oszlop: az adott közgazdasági kategóriához tartozó összeg
	- 4. oszloptól kezdve: az adott közgazdasági (sor) és funkcionális (oszlop) kategóriához tartozó számérték.
	- A számértékből beolvasáskor a `,` és szóköz karakterek eltávolításra kerülnek.



#### Prognózisra vonatkozó formátum

Az ilyen munkalapokról hiányzik a funkcionális bontás. A formátum hasonló az előbbiekben leírtakhoz, az alábbi módosításokkal:

- 1.-3. sor: lényegtelen
- a közgazdasági kategóriák bontása a 4. sortól kezdődik



### data/milestones.tsv

A *Fejlesztések* szakasz tartalmát definiálja.

Formátuma TSV, fejléccel. Oszlopait a vizualizáció korábbi verziójából örökölte, nincs mindegyik használatban és a végleges verzióban változhat a szerkezet.

- `id`: régről visszamaradt oszlop, nincs használatban
- `picture`: a képfájl elérési útvonala
- `title`: fejléc
- `description`: szövegtörzs
- `text 1`: további szövegmező, mely jelenleg a szövegtörzs alatt jelenik meg

```tsv
id	picture	title	description	text 1
!	/assets/img/milestone/0_2019.jpg	Ülésezik Mintaváros képviselő-testülete	A közel 12 ezer lakosú Mintaváros önkormányzata ...	Mintaváros idei költségvetése
1	/assets/img/milestone/func/1_2019.jpg	A Polgármesteri Hivatal épülete	Az általános közszolgáltatások között szerepelnek...	100 Ft-ból 35 forintot költünk közszolgáltatásokra
```



### data/functions.tsv

A funkcionális kategóriák fa struktúráját írja le.

Formátuma TSV, oszlopai: kategória azonosító, címke, szülő kategória azonosító.

Ha az utóbbi oszlopba olyan érték kerül, amihez nem tartozik sor, akkor az adott kategória a gyökérben lesz látható.

```tsv
107054	Családsegítés	1070
107014	Támogatott lakhatás hajléktalan személyek részére	1070
900070	Fejezeti és általános tartalékok elszámolása	9000
...
```



### data/tooltips.tsv

A kategóriákhoz tartozó tooltip-ek szövegeit tartalmazza. Egyelőre csak a nyitóábrában van használva, ahol a közgazdasági bontás felső szintje van megjelenítve.

Formátuma TSV, oszlopai: kategória alternatív azonosítója (`B1`, `B2`, `K1`, `K2`, stb.), tooltip szövege.

Ha egy kategóriához nem szerepel tooltip szöveg ebben a fájlban, ott nem fog megjelenni a tooltip.

```tsv
B1	Lorem ipsum for B1
B2	Lorem ipsum for B2
...
```



### data/<évszám>/*.json (generálható, ld. fent)

Ezek a fájlok az adott év kiadásait (`expense`) vagy bevételeit (`income`) írják le, közgazdasági (`econ`) vagy funkcionális (`func`) bontásban.

Formátuma JSON, mely egy fát ír le. A fa node-jainak az alábbi mezői lehetnek:

- `id`: kategória azonosító
- `name`: kategória elnevezése
- `value`: kategóriához tartozó összeg
- `children`: alkategóriák tömbje

A JSON egy gyökér node-ot tartalmaz.

```json
{
	"children": [
		{
			"id": 306,
			"altId": "K1-K9",
			"name": "Kiadások összesen",
			"value": 916129781,
			"children": [
				{
					"id": 265,
					"altId": "K1-K8",
					"name": "Költségvetési kiadások",
					"value": 631598447,
					"children": [...]
				},
				...
			]
		},
		...
	]
}
```
