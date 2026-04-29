export default defineEventHandler(async (event) => {
	const logos = [
		'cover.jpg',
		'face.png',
		'favicon.png',
		'logo.png',
		'logo-footer.png',
		'pub.jpg',
		'ogimage.jpg',
	];
	const logo = event.context.params?.f || '';
	if (!logos.includes(logo)) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid logo filename' });
	}
	await callNodeListener(
		useMulter(IMG_DIR, logo, ['image/png', 'image/jpeg']).single('logo') as any,
		event.node.req,
		event.node.res,
	);
});
