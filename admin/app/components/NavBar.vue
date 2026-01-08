<script setup lang="ts">
const links = [
	{ href: '/budget/', text: 'Költségvetés' },
	{ href: '/config/', text: 'Konfiguráció' },
	{ href: '/logos/', text: 'Logók' },
	{ href: '/milestones/', text: 'Fejlesztéskártyák képei' },
	{ href: '/site/', text: 'Weboldal' },
];
</script>
<template>
	<div>
		<strong>KÖKÖ Admin | </strong>
		<template
			v-for="(link, index) in links"
			:key="link.href"
		>
			<NuxtLink :to="link.href">{{ link.text }}</NuxtLink>
			<span v-if="index < links.length - 1"> | </span>
		</template>
	</div>
</template>
