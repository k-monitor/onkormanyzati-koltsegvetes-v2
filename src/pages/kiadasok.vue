<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'expense',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.vis.expense + ' - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'expense',
		},
	],
	title: CONFIG.vis.expense + ' - ' + CONFIG.seo.pageTitle,
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<VisualizationSection
			id="expense"
			side="expense"
			:text="CONFIG.vis.expenseText"
			:title="CONFIG.vis.expense"
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
