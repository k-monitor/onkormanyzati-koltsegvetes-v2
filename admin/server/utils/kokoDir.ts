export default () => {
	const { kokoDir } = useRuntimeConfig(); // NUXT_ prefixed overrides
	return kokoDir || process.cwd();
};
