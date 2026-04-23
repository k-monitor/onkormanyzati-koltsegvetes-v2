<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'bevetelek-idosorban',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: 'Bevételek idősorban - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'bevetelek-idosorban',
		},
	],
	title: 'Bevételek idősorban - ' + CONFIG.seo.pageTitle,
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<TimeSeriesSection
			id="time-series-income"
			side="income"
			title="Bevételek idősorban"
			text="**Segítünk értelmezni!** Ez a vizualizáció megmutatja, hogyan változtak az önkormányzat bevételei funkcionális bontásban az évek során. Kattintson egy kategóriára a részletesebb bontás megtekintéséhez!"
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
