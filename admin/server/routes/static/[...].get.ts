export default defineEventHandler(async (event) => {
	return serve(event, STATIC_DIR);
});
