<script setup lang="ts">
import { Cog, Download } from 'lucide-vue-next';

const loading = useLoading();
const serverUrl = useServerUrl();

const error = ref('');
const errorType = ref('');
const dialogOpened = ref(false);

async function buildSite() {
	let r,
		e = '',
		failed = false;
	try {
		loading.value = 'Weboldal generálása...';
		r = await $fetch('/api/buildSite', { method: 'POST' });
		e += r.stderr || '';
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
						:href="serverUrl('/api/zip/site')"
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
						:href="serverUrl('/api/zip/code')"
					>
						<Download />
						Forráskód
					</a>
				</Button>
			</template>
		</PageSection>
	</PageFrame>

	<!-- eslint-disable-next-line vue/no-multiple-template-root -->
	<Dialog v-model:open="dialogOpened">
		<DialogContent
			class="flex max-h-[80vh] min-w-[75%] flex-col"
			@interact-outside.prevent
			@escape-key-down.prevent
		>
			<DialogHeader>
				<DialogTitle>{{ errorType }}</DialogTitle>
			</DialogHeader>
			<div class="prose min-h-0 max-w-full overflow-y-auto pr-8">
				<pre class="w-full overflow-x-auto text-lg">{{ error }}</pre>
			</div>
		</DialogContent>
	</Dialog>
</template>
