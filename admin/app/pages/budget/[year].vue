<script setup lang="ts">
const { data } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	></PageFrame>
</template>
