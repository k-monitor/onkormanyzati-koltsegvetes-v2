import archiver from 'archiver';
import path from 'path';

export default defineEventHandler((event) => {
	const filename = 'koko-code.zip';
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
	archive.directory(path.resolve(dir, 'input'), 'input');
	archive.directory(path.resolve(dir, 'scripts'), 'scripts');
	archive.directory(path.resolve(dir, 'src'), 'src');
	archive.directory(path.resolve(dir, 'static'), 'static');
	archive.file(path.resolve(dir, 'LICENSE'), { name: 'LICENSE' });
	archive.file(path.resolve(dir, 'README.md'), { name: 'README.md' });
	archive.file(path.resolve(dir, 'nuxt.config.ts'), { name: 'nuxt.config.ts' });
	archive.file(path.resolve(dir, 'package.json'), { name: 'package.json' });
	archive.file(path.resolve(dir, 'pnpm-lock.yaml'), { name: 'pnpm-lock.yaml' });
	archive.file(path.resolve(dir, 'tsconfig.json'), { name: 'tsconfig.json' });

	archive.finalize();
	return sendStream(event, archive);
});
