<script setup lang="ts">
// TODO LATER replace confirms with AlertDialogs

const loading = useLoading();
loading.value = true;

const { pending, years } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, Object.keys(years.value || {})) || null);

watchEffect(() => {
	if (!pending.value) loading.value = false;
});

// FIXME causes hydration warning
/*onMounted(() => {
	if (!data.value) {
		prepareBudgetData();
	}
});*/
</script>

<template>
	<PageFrame
		:title="year || 'Betöltés...'"
		group-title="Költségvetés"
	>
		<template v-if="year">
			<BudgetEditorSection :year="year" />
			<YearRenameSection :year="year" />
			<YearDeleteSection :year="year" />
		</template>
	</PageFrame>
</template>
