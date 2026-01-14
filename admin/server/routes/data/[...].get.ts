export default defineEventHandler(async (event) => {
	return serve(event, 'src/data');
});
