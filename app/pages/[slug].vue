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
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + routeName,
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.iframe.title,
		},
		{
			property: 'og:url',
			content: CONFIG.url + routeName,
		},
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
