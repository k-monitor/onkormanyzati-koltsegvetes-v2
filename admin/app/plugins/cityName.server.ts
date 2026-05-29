export default defineNuxtPlugin(async () => {
	const cityName = useState('cityName', () => '');
	try {
		cityName.value = await useRequestFetch()<string>('/api/cityName');
	} catch {}
});
