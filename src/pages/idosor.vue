<script setup lang="ts">
const { year } = useYear();

useHead({
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url + 'idosor',
		},
	],
	meta: [
		{
			property: 'og:title',
			content: 'Idősor - ' + CONFIG.seo.siteName,
		},
		{
			property: 'og:url',
			content: CONFIG.url + 'idosor',
		},
	],
	title: 'Idősor - ' + CONFIG.seo.pageTitle,
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<TimeSeriesSection
			id="time-series-expense"
			side="expense"
			title="Kiadások idősorban"
			text="**Segítünk értelmezni!** Ez a vizualizáció megmutatja, hogyan változtak az önkormányzat kiadásai funkcionális bontásban az évek során. Kattintson egy kategóriára a részletesebb bontás megtekintéséhez!"
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
