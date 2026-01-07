export default () => {
	const { kokoDir } = useRuntimeConfig();
	return kokoDir || process.cwd();
};
