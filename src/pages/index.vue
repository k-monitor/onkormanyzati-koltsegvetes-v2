<script setup lang="ts">
useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url,
		},

		{
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/introjs.min.css',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.seo.ogTitle,
		},
		{
			property: 'og:url',
			content: CONFIG.url,
		},
	],
	script: [
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.1/tinycolor.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/intro.min.js' },
	],
	title: CONFIG.seo.pageTitle,
});
</script>

<template>
	<DefaultLayout />
</template>
