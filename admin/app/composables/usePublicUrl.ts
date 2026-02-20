export default async () => {
	const { data: publicUrl } = await useAsyncData(() => $fetch<string>('/api/publicUrl'));

	return computed(() => publicUrl.value || '');
};
