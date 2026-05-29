export default () => {
	const cityName = useState('cityName', () => '');

	async function reload() {
		cityName.value = await $fetch<string>('/api/cityName');
	}

	return { cityName: readonly(cityName), reload };
};
