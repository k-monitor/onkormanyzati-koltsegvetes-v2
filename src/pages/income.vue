<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'income',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.vis.income + ' - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'income',
		},
	],
	title: CONFIG.vis.income + ' - ' + CONFIG.seo.pageTitle,
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<VisualizationSection
			id="income"
			side="income"
			:text="CONFIG.vis.incomeText"
			:title="CONFIG.vis.income"
		/>
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

hr.divider {
	max-width: 3.25rem;
	border-width: 0.2rem;
	border-color: $primary;
}

.page-section {
	padding: 2rem 0;
}
</style>
