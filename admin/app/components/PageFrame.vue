<script setup lang="ts">
const { title } = defineProps<{
	groupTitle?: string;
	title: string;
}>();

useHead({
	title,
	titleTemplate: '%s | KÖKÖ Admin',
});
</script>

<template>
	<main class="prose mx-auto my-8 w-[65ch] px-4 lg:px-0">
		<p
			v-if="groupTitle"
			class="text-muted-foreground mb-2 text-lg font-medium"
		>
			{{ groupTitle }}
		</p>
		<h1>{{ title }}</h1>
		<slot />
	</main>
</template>
