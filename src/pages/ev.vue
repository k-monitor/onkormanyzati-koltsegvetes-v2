<script setup lang="ts">
const { canShowMilestones, year, handleYearSelected, setHashMode, reinitializeFromHash } = useYear();
setHashMode('full');
onMounted(() => {
	reinitializeFromHash();
	const { pendingBudgetJump } = usePendingBudgetJump();
	const pending = pendingBudgetJump.value;
	if (pending) {
		pendingBudgetJump.value = null;
		const $ = window.$;
		if (pending.year && String(pending.year) !== year.value) {
			handleYearSelected(String(pending.year));
		}
		setTimeout(() => {
			scrollToElement($('#' + pending.side), 72);
			setTimeout(() => {
				if (pending.side === 'milestones') {
					eventBus.emit('ms', pending.id);
				} else {
					eventBus.emit('jump', pending);
				}
			}, 1000);
		}, 500);
	}
});

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
		<Welcome year-specific />
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
		</template>
	</DefaultLayout>
</template>
