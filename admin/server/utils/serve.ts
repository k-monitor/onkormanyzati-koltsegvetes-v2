import fs from 'fs';
import path from 'path';
import type { H3Event } from 'h3';

export default (event: H3Event, dir: 'input' | 'src/data' | 'static') => {
	const baseDir = path.resolve(kokoDir());
	const file = path.resolve(baseDir, dir, event.context.params?._ || '');
	if (!file.startsWith(baseDir + path.sep)) {
		throw createError({ status: 403 });
	}
	if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
		throw createError({ status: 404 });
	}
	return sendStream(event, fs.createReadStream(file));
};
