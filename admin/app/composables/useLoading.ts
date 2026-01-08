export default () => {
	const loading = useState<boolean | string>('loading', () => false);
	// TODO LATER would be nice to keep a list of running tasks, and manage value based on its emptiness
	return loading;
};
