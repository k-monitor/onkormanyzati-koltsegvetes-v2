<script setup lang="ts">
const slug = useRoute().params.slug as string;

const routeName = slugify(CONFIG.iframe.title).toLowerCase();
if (!routeName || slug !== routeName) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Not Found',
	});
}

useHead({
	bodyAttrs: {
		id: 'page-top',
	},
	htmlAttrs: {
		lang: 'hu',
	},
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url,
		},
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=latin-ext',
		},
		{
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css',
		},
	],
	meta: [
		{
			property: 'og:site_name',
			content: CONFIG.seo.siteName,
		},
		{
			property: 'og:title',
			content: CONFIG.iframe.title,
		},
		{
			name: 'description',
			property: 'og:description',
			content: CONFIG.seo.description,
		},
		{
			property: 'og:url',
			content: CONFIG.url,
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'og:image',
			content: CONFIG.url + 'assets/img/ogimage.jpg',
		},
	],
	script: [
		{ src: 'https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js' },
		{ src: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js' },
	],
	title: CONFIG.iframe.title,
});
</script>

<template>
	<div class="d-flex flex-column _h-100">
		<NavBar subpage-mode />
		<div
			class="bg-primary"
			style="padding-top: 7rem; height: 90vh; min-height: 600px"
		>
			<iframe
				class="h-100 w-100"
				frameborder="0"
				:src="CONFIG.iframe.url"
			></iframe>
		</div>
		<Footer />
	</div>
</template>
