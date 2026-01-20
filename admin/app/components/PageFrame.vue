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
	<main class="my-8">
		<ProseBlock class="pb-8">
			<p
				v-if="groupTitle"
				class="text-muted-foreground mb-2 text-lg font-medium"
			>
				{{ groupTitle }}
			</p>
			<h1>{{ title }}</h1>
		</ProseBlock>
		<div class="flex flex-col gap-8 divide-y [&>div]:pb-8">
			<slot />
		</div>
	</main>
</template>
