<script setup lang="ts">
const { data } = await useBudgetData();

const slugifiedYear = useRoute().params.year as string;

const years = computed(() => Object.keys(data.value || {}));
const year = computed(() => deslugifyYear(slugifiedYear, years.value) || slugifiedYear);
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	></PageFrame>
</template>
