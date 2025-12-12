export default defineEventHandler((event) => {
	const { publicUrl } = useRuntimeConfig();
	return publicUrl;
});
