<script setup lang="ts">
const { canShowMilestones, year, setHashMode, reinitializeFromHash } = useYear();
setHashMode('full');
onMounted(() => reinitializeFromHash());

useHead({
	meta: [
		{
			property: 'og:title',
			content: CONFIG.seo.ogTitle,
		},
	],
	title: () =>
		[year.value, CONFIG.seo.pageTitle, CONFIG.seo.siteName].filter(Boolean).join(' | '),
});
</script>

<template>
	<DefaultLayout show-year-selector>
		<template
			v-for="mod in MODULES_ORDER"
			:key="mod"
		>
			<PublicationSection v-if="mod === 'pub' && CONFIG.modules.pub" />
			<Inex
				v-else-if="mod === 'inex' && CONFIG.modules.inex"
				class="bg-light"
			/>
			<VisualizationSection
				v-else-if="mod === 'income' && CONFIG.modules.income"
				id="income"
				side="income"
				:text="CONFIG.vis.incomeText"
				:title="CONFIG.vis.income"
			/>
			<VisualizationSection
				v-else-if="mod === 'expense'"
				id="expense"
				class="bg-light"
				side="expense"
				:text="CONFIG.vis.expenseText"
				:title="CONFIG.vis.expense"
			/>
			<MilestoneSection
				v-else-if="mod === 'milestones' && canShowMilestones"
				id="milestones"
				class="pb-0"
			/>
			<FeedbackSection v-else-if="mod === 'feedback' && CONFIG.modules.feedback" />
		</template>
	</DefaultLayout>
</template>
