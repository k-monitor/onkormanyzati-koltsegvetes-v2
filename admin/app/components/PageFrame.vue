<script setup lang="ts">
defineProps<{
	title: string;
}>();
</script>

<template>
	<main class="prose mx-auto my-8">
		<h1>{{ title }}</h1>
		<slot />
	</main>
</template>
