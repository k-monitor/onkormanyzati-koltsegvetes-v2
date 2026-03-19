import fs from 'fs';
import path from 'path';

export default defineEventHandler(() => {
	const dir = path.resolve(useConfig().kokoDir, MS_DIR);
	return fs.readdirSync(dir);
});
