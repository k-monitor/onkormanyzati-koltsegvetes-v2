<script setup lang="ts">
import { CircleAlert, Copy } from 'lucide-vue-next';
import { joinURL } from 'ufo';
import { toast } from 'vue-sonner';

const embeds = [
	{ name: 'Bevételek', path: '/bevetelek/', maxHeight: '1100px' },
	{ name: 'Kiadások', path: '/kiadasok/', maxHeight: '1100px' },
	{ name: 'Mérleg', path: '/merleg/' },
	{ name: 'Térkép', path: '/terkep/', maxHeight: '620px' },
];

const kokoUrl = usePublicUrl();

function getEmbedCode(path: string, maxHeight = '1200px') {
	const embedUrl = joinURL(kokoUrl.value, path);
	const code = `<iframe src="${embedUrl}" width="100%" height="${maxHeight}" frameborder="0"></iframe>`;
	return code.replaceAll(/\s+/g, '\n\t').replace('><', '\n><');
}

async function copyToClipboard(path: string, maxHeight = '1200px') {
	const code = getEmbedCode(path, maxHeight);
	try {
		await navigator.clipboard.writeText(code);
		toast.info('Beágyazó kód vágólapra másolva!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült a másolás!');
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
			<pre>{{ getEmbedCode(embed.path, embed.maxHeight) }}</pre>
			<template #actions>
				<Button @click="copyToClipboard(embed.path, embed.maxHeight)">
					<Copy />
					Másolás
				</Button>
			</template>
		</PageSection>
	</PageFrame>
</template>
