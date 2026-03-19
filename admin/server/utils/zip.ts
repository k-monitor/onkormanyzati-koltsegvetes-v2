import archiver from 'archiver';
import path from 'path';
import type { H3Event } from 'h3';

export default (event: H3Event, filename: string, directories: string[], files: string[]) => {
	setHeader(event, 'content-disposition', `attachment; filename=${filename}`);
	setHeader(event, 'content-type', 'application/zip');

	const archive = archiver('zip', { zlib: { level: 9 } });

	archive.on('warning', function (err: unknown) {
		throw err;
	});
	archive.on('error', function (err: unknown) {
		throw err;
	});

	const dir = useConfig().kokoDir;
	directories.forEach((d) => archive.directory(path.resolve(dir, d), d));
	files.forEach((f) => archive.file(path.resolve(dir, f), { name: path.basename(f) }));

	archive.finalize();
	return sendStream(event, archive);
};
