export default defineEventHandler(async (event) => {
	return serve(event, INPUT_DIR);
});
