<script setup lang="ts">
import { Cog, Download } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const loading = useLoading();
const serverUrl = useServerUrl();

const error = ref('');
const errorType = ref('');
const dialogOpened = ref(false);
const pollingId = ref<ReturnType<typeof setInterval> | null>(null);
const pollingInFlight = ref(false);

type BuildStatusResponse = {
	status: 'idle' | 'running' | 'success' | 'failed';
	stderr: string;
	error: string;
	startedAt: string | null;
	finishedAt: string | null;
};

function stopPolling() {
	if (!pollingId.value) return;
	clearInterval(pollingId.value);
	pollingId.value = null;
}

function showResultDialog(result: BuildStatusResponse) {
	const output = [result.error, result.stderr].filter(Boolean).join('\n');
	error.value = output;

	if (result.status === 'failed') {
		errorType.value = 'Nem sikerült!';
		dialogOpened.value = true;
		return;
	}

	errorType.value = 'Nem stimmelnek az adatok';
	if (output.includes('[KÖKÖ]')) {
		dialogOpened.value = true;
	}
}

async function pollBuildStatus() {
	if (pollingInFlight.value) return;
	pollingInFlight.value = true;

	let result: BuildStatusResponse;
	try {
		result = await $fetch<BuildStatusResponse>('/api/buildSite');
	} finally {
		pollingInFlight.value = false;
	}

	if (result.status === 'running') return;

	stopPolling();
	loading.value = false;
	showResultDialog(result);
}

async function buildSite() {
	try {
		loading.value = 'Weboldal generálása...';
		dialogOpened.value = false;
		await $fetch('/api/buildSite', { method: 'POST' });
		stopPolling();
		pollingId.value = setInterval(() => {
			void pollBuildStatus();
		}, 3000);
		await pollBuildStatus();
	} catch (e) {
		stopPolling();
		loading.value = false;
		const maybeError = e as { data?: { error?: string }; message?: string };
		error.value = maybeError.data?.error || maybeError.message || String(e);
		errorType.value = 'Nem sikerült!';
		dialogOpened.value = true;
	}
}

onBeforeUnmount(() => {
	stopPolling();
});
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
