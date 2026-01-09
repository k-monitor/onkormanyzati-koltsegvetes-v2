<script setup lang="ts">
const loading = useLoading();
const error = ref('');
const errorType = ref('');

async function buildSite() {
	let r,
		e = '',
		failed = false;
	try {
		loading.value = 'Weboldal generálása...';
		r = await fetch('/api/buildSite', { method: 'POST' });
		e += (await r.json()).stderr || '';
		if (r.status >= 400) throw '';

		loading.value = 'Weboldal publikálása...';
		r = await fetch('/api/deploySite', { method: 'POST' });
		e += (await r.json()).stderr || '';
		if (r.status >= 400) throw '';
	} catch (error) {
		// actual build/deploy failure
		failed = true;
		e += error;
	} finally {
		console.error(e);
		error.value = e;
		errorType.value = failed ? 'Nem sikerült!' : 'Nem stimmelnek az adatok';
		if (failed || e.includes('[KÖKÖ]')) {
			// acutal failure OR invalid data (which is HTTP 200)
			// FIXME admin modal (title: errorType, body: error)
			//new bootstrap.Modal(document.getElementById('errorModal')).show();
		}
		loading.value = false;
	}
}
</script>

<template>
	<h1>Weboldal</h1>
	<p>
		A KÖKÖ site-ot a költségvetés, konfiguráció, vagy képek módosítása után le kell generálni.
		Ez a folyamat akár 1-2 percig is tarthat.
	</p>
	<p>
		Generálás után a site fájljai letölthetőek ZIP-ben. Ez egy
		<code>dist</code> mappát fog tartalmazni, ezt lehet webszerveren hosztolni. Fontos, hogy a
		site végleges URL-jét a konfigban előzetesen be kell állítani!
	</p>
	<p>
		Lehetőség van a forráskód letöltésére is, a generált ZIP fájl tartalmazza a feltöltött
		fájlokat és a használati útmutatót is.
	</p>
	<a
		class="btn btn-outline-primary"
		href="/api/zipCode"
		target="_blank"
	>
		<i class="fas fa-fw fa-code me-1"></i>
		Forráskód
	</a>
	<button
		class="btn btn-success"
		@click="buildSite"
	>
		<i class="fas fa-fw fa-cog me-1"></i>
		Generálás
	</button>
	<a
		class="btn btn-primary"
		href="/api/zipSite"
		target="_blank"
	>
		<i class="fas fa-fw fa-download me-1"></i>
		Kész site
	</a>
</template>
