import fs from 'fs';
fs.copyFileSync('./input/budget.xlsx', './static/budget.xlsx');

const newFavicon = './static/assets/img/favicon.png';
const oldFavicon = './static/favicon.png';
if (fs.existsSync(oldFavicon)) {
	if (fs.existsSync(newFavicon)) {
		console.error(
			'[KÖKÖ] static/favicon.png és static/assets/img/favicon.png is létezik, de csak az utóbbit használja a program. Kérlek válaszd ki a megfelelőt, és azt tartsd meg static/assets/img/favicon.png útvonalon, a static/favicon.png-t pedig töröld!',
		);
	} else {
		fs.renameSync(oldFavicon, newFavicon);
	}
}
