<script setup lang="ts">
import { Cog, Download } from 'lucide-vue-next';

const loading = useLoading();
const error = ref('');
const errorType = ref('');
const dialogOpened = ref(false);

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
			dialogOpened.value = true;
		}
		loading.value = false;
	}
}
</script>

<template>
	<PageFrame title="Weboldal">
		<PageSection>
			<p>
				A KÖKÖ site-ot a költségvetés, konfiguráció, vagy képek módosítása után le kell
				generálni. Ez a folyamat akár 1-2 percig is tarthat.
			</p>
			<template #actions>
				<Button @click="buildSite">
					<Cog />
					Generálás
				</Button>
			</template>
		</PageSection>
		<PageSection>
			<p>
				Generálás után a site fájljai letölthetőek ZIP-ben. Ez egy
				<code>dist</code> mappát fog tartalmazni, ezt lehet webszerveren hosztolni. Fontos,
				hogy a site végleges URL-jét a konfigban előzetesen be kell állítani!
			</p>
			<template #actions>
				<Button
					as-child
					variant="secondary"
				>
					<a
						download
						href="/api/zip/site"
					>
						<Download />
						Kész site
					</a>
				</Button>
			</template>
		</PageSection>
		<PageSection>
			<p>
				Lehetőség van a forráskód letöltésére is, a generált ZIP fájl tartalmazza a
				feltöltött fájlokat és a használati útmutatót is.
			</p>
			<template #actions>
				<Button
					as-child
					variant="secondary"
				>
					<a
						download
						href="/api/zip/code"
					>
						<Download />
						Forráskód
					</a>
				</Button>
			</template>
		</PageSection>
	</PageFrame>

	<Dialog v-model:open="dialogOpened">
		<DialogContent
			class="min-w-3/4"
			@interact-outside.prevent
			@escape-key-down.prevent
		>
			<DialogHeader>
				<DialogTitle>{{ errorType }}</DialogTitle>
				<DialogDescription class="prose max-h-[75vh] max-w-full overflow-y-scroll">
					<pre class="text-left text-lg">{{ error }}</pre>
				</DialogDescription>
			</DialogHeader>
		</DialogContent>
	</Dialog>
</template>
