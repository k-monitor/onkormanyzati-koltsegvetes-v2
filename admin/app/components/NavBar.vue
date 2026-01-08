<script setup lang="ts">
const links = [
	{ href: '/budget/', text: 'Költségvetés' },
	{ href: '/config/', text: 'Konfiguráció' },
	{ href: '/logos/', text: 'Logók' },
	{ href: '/milestones/', text: 'Fejlesztéskártyák képei' },
	{ href: '/site/', text: 'Weboldal' },
	{
		href: 'https://github.com/k-monitor/onkormanyzati-koltsegvetes-v2',
		text: 'Dokumentáció',
		external: true,
	},
];
</script>
<template>
	<div>
		<strong>KÖKÖ Admin |</strong>
		<template
			v-for="(link, index) in links"
			:key="link.href"
		>
			<NuxtLink
				:to="link.href"
				:target="link.external ? '_blank' : undefined"
				>{{ link.text }}</NuxtLink
			>
			<span v-if="index < links.length - 1"> | </span>
		</template>
	</div>
</template>
