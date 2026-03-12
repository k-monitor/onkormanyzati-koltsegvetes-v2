<script setup lang="ts">
// TODO LATER replace confirms with AlertDialogs

const { years } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, Object.keys(years.value || {})) || null);
</script>

<template>
	<PageFrame
		:title="year || slugifiedYear"
		group-title="Költségvetés"
	>
		<template v-if="year">
			<BudgetEditorSection :year="year" />
			<YearRenameSection :year="year" />
			<YearDeleteSection :year="year" />
		</template>
	</PageFrame>
	<!-- eslint-disable-next-line vue/no-multiple-template-root -->
	<BudgetSaveBanner />
</template>
