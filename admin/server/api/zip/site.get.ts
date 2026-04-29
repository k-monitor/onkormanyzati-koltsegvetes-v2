export default defineEventHandler((event) => {
	return zip(event, 'koko-site.zip', ['dist'], []);
});
