import fs from 'fs';
import path from 'path';
import { H3Event } from 'h3';

export default (event: H3Event, dir: string) => {
	const baseDir = path.resolve(process.cwd());
	const file = path.resolve(baseDir, dir, event.context.params?._ || '');
	if (!file.startsWith(baseDir + path.sep)) {
		throw createError({ status: 403 });
	}
	if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
		throw createError({ status: 404 });
	}
	return sendStream(event, fs.createReadStream(file));
};
