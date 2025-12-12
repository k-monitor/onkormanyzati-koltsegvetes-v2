import archiver from 'archiver';

export default defineEventHandler((event) => {
	const filename = 'koko-site.zip';
	setHeader(event, 'content-disposition', `attachment; filename=${filename}`);

	const archive = archiver('zip', { zlib: { level: 9 } });
	const output = event.node.res;

	archive.on('warning', function (err: unknown) {
		throw err;
	});
	archive.on('error', function (err: unknown) {
		throw err;
	});

	archive.directory('dist', 'dist');

	archive.pipe(output);
	return archive.finalize();
});
