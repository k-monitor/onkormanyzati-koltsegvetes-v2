import archiver from 'archiver';
import path from 'path';

export default defineEventHandler((event) => {
	const filename = 'koko-site.zip';
	setHeader(event, 'content-disposition', `attachment; filename=${filename}`);
	setHeader(event, 'content-type', 'application/zip');

	const archive = archiver('zip', { zlib: { level: 9 } });

	archive.on('warning', function (err: unknown) {
		throw err;
	});
	archive.on('error', function (err: unknown) {
		throw err;
	});

	const dir = kokoDir();
	archive.directory(path.resolve(dir, 'dist'), 'dist');

	archive.finalize();
	return sendStream(event, archive);
});
