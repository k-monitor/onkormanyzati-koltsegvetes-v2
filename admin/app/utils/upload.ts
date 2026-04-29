import { toast } from 'vue-sonner';

export default async (endpoint: string, field: string, ref: HTMLInputElement) => {
	if (!ref.files) return;
	const loading = useLoading(); // maybe it's not elegant calling composable from util?

	loading.value = 'Feltöltés...';
	const body = new FormData();

	for (let i = 0; i < ref.files.length; i++) {
		body.append(field, ref.files[i]!);
	}
	try {
		await $fetch(endpoint, { method: 'POST', body });
		toast.success('Fájl(ok) sikeresen feltöltve!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült feltölteni a fájl(oka)t.');
	} finally {
		ref.value = '';
		loading.value = false;
	}
};
