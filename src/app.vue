<script setup lang="ts">
useHead({
	bodyAttrs: {
		id: 'page-top',
	},
	htmlAttrs: {
		lang: 'hu',
	},
	link: [
		{
			rel: 'icon',
			type: 'image/png',
			href: '/assets/img/favicon.png',
		},
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
			content: CONFIG.seo.ogTitle,
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
});

// TODO LATER cookie consent dialog
// const agreedToCookies = ref(false);

if (CONFIG.ga.id) {
	const { proxy } = useScriptGoogleAnalytics({
		id: CONFIG.ga.id,
		/*scriptOptions: {
			trigger: useScriptTriggerConsent({
				consent: agreedToCookies,
			}),
		},*/
	});
	useScriptEventPage(() => {
		proxy.gtag('event', 'page_view');
	});
}

if (CONFIG.gtm.id) {
	const { proxy } = useScriptGoogleTagManager({
		id: CONFIG.gtm.id,
		/*scriptOptions: {
			trigger: useScriptTriggerConsent({
				consent: agreedToCookies,
			}),
		},*/
	});
	useScriptEventPage(({ title, path }) => {
		proxy.dataLayer.push({
			event: 'pageview',
			title,
			path,
		});
	});
}
</script>

<template>
	<div>
		<NuxtLoadingIndicator />
		<NuxtPage />
	</div>
</template>
