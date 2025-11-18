import fs from 'fs';
fs.copyFileSync('./input/budget.xlsx', './static/budget.xlsx');

const newFavicon = './static/assets/img/favicon.png';
const oldFavicon = './src/favicon.png';
if (fs.existsSync(oldFavicon)) {
	if (fs.existsSync(newFavicon)) {
		console.error(
			`[KÖKÖ] ${oldFavicon} és ${newFavicon} is létezik, de csak az utóbbit használja a program. Kérlek válaszd ki a megfelelőt, és azt tartsd meg ${newFavicon} útvonalon, a ${oldFavicon} -t pedig töröld!`,
		);
	} else {
		fs.renameSync(oldFavicon, newFavicon);
	}
}
