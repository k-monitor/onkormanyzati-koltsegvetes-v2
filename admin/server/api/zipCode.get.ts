import archiver from 'archiver';

export default defineEventHandler((event) => {
	const filename = 'koko-code.zip';
	setHeader(event, 'content-disposition', `attachment; filename=${filename}`);

	const archive = archiver('zip', { zlib: { level: 9 } });
	const output = event.node.res;

	archive.on('warning', function (err: unknown) {
		throw err;
	});
	archive.on('error', function (err: unknown) {
		throw err;
	});

	archive.directory('input', 'input');
	archive.directory('scripts', 'scripts');
	archive.directory('src', 'src');
	archive.directory('static', 'static');
	archive.file('LICENSE', { name: 'LICENSE' });
	archive.file('README.md', { name: 'README.md' });
	archive.file('nuxt.config.ts', { name: 'nuxt.config.ts' });
	archive.file('package.json', { name: 'package.json' });
	archive.file('pnpm-lock.yaml', { name: 'pnpm-lock.yaml' });
	archive.file('tsconfig.json', { name: 'tsconfig.json' });

	archive.pipe(output);
	return archive.finalize();
});
