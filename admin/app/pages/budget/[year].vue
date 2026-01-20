<script setup lang="ts">
// TODO LATER replace confirms with AlertDialogs

const { data } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	>
		<YearRenameSection :year="year" />
		<YearDeleteSection :year="year" />
	</PageFrame>
</template>
