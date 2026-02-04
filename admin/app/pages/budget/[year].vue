<script setup lang="ts">
// TODO LATER replace confirms with AlertDialogs

const loading = useLoading();
loading.value = true;

const { data, prepareBudgetData, pending, years } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(
	() => deslugifyYear(slugifiedYear, Object.keys(years.value)) || slugifiedYear,
);

watchEffect(() => {
	if (!pending.value) loading.value = false;
});

onMounted(() => {
	if (!data.value) {
		prepareBudgetData();
	}
});
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	>
		<BudgetEditorSection :year="year" />
		<YearRenameSection :year="year" />
		<YearDeleteSection :year="year" />
	</PageFrame>
</template>
