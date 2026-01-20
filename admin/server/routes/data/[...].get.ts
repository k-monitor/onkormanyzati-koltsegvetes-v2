export default defineEventHandler(async (event) => {
	return serve(event, DATA_DIR);
});
