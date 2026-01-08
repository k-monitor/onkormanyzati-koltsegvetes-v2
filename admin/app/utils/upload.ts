export default async (endpoint: string, field: string, ref: HTMLInputElement) => {
	if (!ref.files) return;
	// FIXME admin loading
	//this.loading = 'Feltöltés...';
	const body = new FormData();

	for (let i = 0; i < ref.files.length; i++) {
		body.append(field, ref.files[i]!);
	}
	try {
		await fetch(endpoint, { method: 'POST', body });
	} catch {
		alert('Nem sikerült! :C');
	} finally {
		ref.value = '';
		//this.loading = false;
	}
};
