# Önkormányzati költségvetés vizualizáció 2.0+

Az oldal alapja a StartBootstrap / Creative sablon.



## Adatok

A vizualizáció az alábbi adatfájlokból dolgozik:

- `data/functions.tsv`: a funkcionális kategóriák fa struktúrája
- `data/<évszám>/expense.tsv`: kiadásra vonatkozó összegek, közgazdasági és funkcionális bontásban
- `data/<évszám>/expense-tree.tsv`: kiadásra vonatkozó közgazdasági kategóriák fa struktúrája
- `data/<évszám>/income.tsv`: bevételre vonatkozó összegek, közgazdasági és funkcionális bontásban
- `data/<évszám>/income-tree.tsv`: bevételre vonatkozó közgazdasági kategóriák fa struktúrája

Az első fájl adott, míg a többi **legenerálható az általános KGR rendszer importjából,** ami egy XLSX (Excel) fájl.

Ezt a fájlt ajánlott a `data/src/` könyvtárba helyezni, majd a TSV fájlokat az alábbi paranccsal lehet elkészíteni:

```
node scripts/prepare-data data/src/input_fajl.xslx
```



### Excel fájl formátuma

A munkafüzet több munkalapból állhat, melyek elnevezése a következő lehet: `ÉVSZÁM <TÍPUS>`, ahol a `<TÍPUS>` lehet `BEVÉTEL` vagy `KIADÁS`.

A program ezeket a neveket átalakítja fájlnevekké a következő módon:

```
Munkalapok:         Fájlok:

2018 BEVÉTEL   ->   data/2018/income.tsv   +  data/2018/income-tree.tsv
2018 KIADÁS    ->   data/2018/expense.tsv  +  data/2018/expense-tree.tsv
2019 BEVÉTEL   ->   data/2019/income.tsv   +  data/2019/income-tree.tsv
2019 KIADÁS    ->   data/2019/expense.tsv  +  data/2019/expense-tree.tsv
```

A program minden munkafüzethez le fog generálni 2 TSV fájlt. Az egyik a mátrixot írja le tömörebb formában, a másik pedig a közgazdasági kategóriák fa struktúráját. (Részletek alább.)

A munkalapoknak 2 formátumát ismeri a program. Az egyik az elmúlt évekre vonatkozik, a másik a prognózisokra. A bevételi és kiadási oldal adott éven belül azonos formátumú.



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



### data/functions.tsv

A funkcionális kategóriák fa struktúráját írja le.

Formátuma TSV, oszlopai: kategória azonosító, címke, szülő kategória azonosító.

Ha az utóbbi oszlopba olyan érték kerül, amihez nem tartozik sor, akkor az adott kategória a gyökérben lesz látható.

```tsv
id,value,parent_id
107054,Családsegítés,1070
107014,Támogatott lakhatás hajléktalan személyek részére,1070
900070,Fejezeti és általános tartalékok elszámolása,9000
...
```



### data/<évszám>/expense.tsv és income.tsv

Az adott év kiadásait és bevételeit írják le közgazdasági és funkcionális bontásban.

Formátuma TSV, oszlopai: közgazdasági kategória azonosítója, funkcionális kategória azonosítója, összeg.

Ahol a funkcionális kategória azonosítója helyett `+` jel van, az csak a közgazdasági kategória szerinti összegzést jelent, vagyis benne van az összes funkcionális kategória. Erre a prognózisoknál van szükség, ahol a funkcionális bontás nem ismert.

```tsv
...
09	082044	137772
09	086090	15308
10	+	53130
10	066020	53130
...
```



### data/<évszám>/expense-tree.tsv és income-tree.tsv

Az adott év kiadásaihoz és bevételeihez tartozó közgazdasági kategóriák fa struktúráját írják le.

Formátuma TSV, oszlopai: kategória azonosítója, elnevezése, szülő kategória azonosítója.

```tsv
01	Törvény szerinti illetmények, munkabérek	15
04	Készenléti, ügyeleti, helyettesítési díj, túlóra, túlszolgálat	15
07	Béren kívüli juttatások	15
09	Közlekedési költségtérítés	15
...
```
