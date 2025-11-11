<script setup lang="ts">
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
