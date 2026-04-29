import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
	const f = event.context.params?.f || '';
	if (!f) return;
	const fn = path.resolve(useConfig().kokoDir, `static/assets/ms/${f}`);
	if (fs.existsSync(fn)) fs.unlinkSync(fn);
});
