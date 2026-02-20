export default defineEventHandler(() => {
	const {
		public: { url },
	} = useRuntimeConfig(); // NUXT_ prefixed overrides
	return url || process.env.PUBLIC_URL || '';
});
