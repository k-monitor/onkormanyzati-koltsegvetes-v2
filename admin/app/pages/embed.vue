<script setup lang="ts">
import { Copy } from 'lucide-vue-next';

const embeds = [
	{ name: 'Bevételek', path: '/bevetelek/' },
	{ name: 'Kiadások', path: '/kiadasok/' },
	{ name: 'Mérleg', path: '/merleg/' },
];

const {
	public: { url: kokoUrl },
} = useRuntimeConfig();

function getEmbedCode(path: string) {
	const baseUrl = kokoUrl.replace(/\/$/, '');
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
