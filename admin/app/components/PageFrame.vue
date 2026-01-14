<script setup lang="ts">
defineProps<{
	title: string;
}>();
</script>

<template>
	<main class="prose mx-auto my-8 w-[65ch] px-4 lg:px-0">
		<h1>{{ title }}</h1>
		<slot />
	</main>
</template>
