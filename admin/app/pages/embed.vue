<script setup lang="ts">
import { CircleAlert, Copy } from 'lucide-vue-next';

const embeds = [
	{ name: 'Bevételek', path: 'bevetelek/' },
	{ name: 'Kiadások', path: 'kiadasok/' },
	{ name: 'Mérleg', path: 'merleg/' },
];

const kokoUrl = await usePublicUrl();

function getEmbedCode(path: string) {
	const baseUrl = kokoUrl.value.replace(/\/$/, '');
	const code = `<iframe src="${baseUrl}${path}" width="100%" height="1200px" frameborder="0"></iframe>`;
	return code.replaceAll(/\s+/g, '\n\t').replace('><', '\n><');
}

async function copyToClipboard(path: string) {
	const code = getEmbedCode(path);
	try {
		await navigator.clipboard.writeText(code);
		alert('Vágólapra másolva!');
	} catch {
		alert('Nem sikerült a másolás!');
	}
}
</script>

<template>
	<PageFrame title="Beágyazás">
		<PageSection>
			<p>
				A bevétel, kiadás és mérleg ábrák külön beágyazhatók más oldalakba az alábbi HTML
				kódokkal.
			</p>

			<Alert
				v-if="!kokoUrl"
				class="not-prose"
				variant="destructive"
			>
				<CircleAlert />
				<AlertTitle>
					A <code>NUXT_PUBLIC_URL</code> környezeti változó nincs beállítva.</AlertTitle
				>
				<AlertDescription>
					Állítsd be a KÖKÖ publikus URL-jére, majd indítsd újra az admin felületet.
				</AlertDescription>
			</Alert>
		</PageSection>
		<PageSection
			v-for="embed in embeds"
			:key="embed.path"
		>
			<p>{{ embed.name }}</p>
			<pre>{{ getEmbedCode(embed.path) }}</pre>
			<template #actions>
				<Button @click="copyToClipboard(embed.path)">
					<Copy />
					Másolás
				</Button>
			</template>
		</PageSection>
	</PageFrame>
</template>
