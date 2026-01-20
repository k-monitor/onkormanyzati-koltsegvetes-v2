<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'inex',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.inex.title + ' - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'inex',
		},
	],
	title: CONFIG.inex.title + ' - ' + CONFIG.seo.pageTitle,
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<Inex />
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
