import fs from 'fs';
import path from 'path';

export default defineEventHandler(() => {
	const dir = path.resolve(kokoDir(), 'static/assets/ms');
	return fs.readdirSync(dir);
});
