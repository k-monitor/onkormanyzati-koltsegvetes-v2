export default () => {
	const loading = useState<boolean | string>('loading', () => false);
	// TODO LATER maybe keep a list of running tasks, and manage value based on its emptiness
	return loading;
};
