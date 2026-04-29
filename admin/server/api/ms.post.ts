export default defineEventHandler(async (event) => {
	await callNodeListener(
		useMulter(MS_DIR, null, ['image/png', 'image/jpeg', 'video/mp4']).array('ms') as any,
		event.node.req,
		event.node.res,
	);
});
