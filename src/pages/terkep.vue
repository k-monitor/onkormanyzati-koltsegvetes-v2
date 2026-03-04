<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'map',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.map.title + ' - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'map',
		},
	],
	title: CONFIG.map.title + ' - ' + CONFIG.seo.pageTitle,
});

function openDetailsUrl(milestoneId: string) {
	window.open('/#'+year.value+'/terkep/' + milestoneId, '_blank');
}

</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<ClientOnly>
			<MapSection assetPrefix="../" :detailsHandler="openDetailsUrl" />
		</ClientOnly>
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/bootstrap';
@import '../scss/theme';

body,
html {
	width: 100%;
	height: 100%;
}

h1,
h2 {
	text-transform: uppercase;
}
</style>
