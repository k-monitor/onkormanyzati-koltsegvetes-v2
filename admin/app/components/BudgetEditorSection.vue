<script setup lang="ts">
import { ArrowDownToDot, ArrowUpFromDot, ChartPie, Presentation } from 'lucide-vue-next';
import PageSection from './PageSection.vue';

const { year } = defineProps<{
	year: string;
}>();

const sides = [
	{ key: 'income' as const, label: 'Bevételek', icon: ArrowDownToDot },
	{ key: 'expense' as const, label: 'Kiadások', icon: ArrowUpFromDot },
];
type SideKey = (typeof sides)[number]['key'];
const side = ref<SideKey>('income');

const types = [
	{ key: 'econ' as const, label: 'Közgazdasági', icon: ChartPie },
	{ key: 'func' as const, label: 'Funkcionális', icon: Presentation },
];
type TypeKey = (typeof types)[number]['key'];
const type = ref<TypeKey>('econ');

const { data } = await useBudgetData();
const budget = computed(() => {
	const yearData = data.value?.[year];
	const sideData = yearData?.[side.value];
	const typeData = sideData?.[type.value];
	return typeData || null;
});
</script>

<template>
	<PageSection>
		<div class="mb-8 flex flex-wrap justify-between gap-4">
			<ToggleGroup
				v-model="side"
				type="single"
				variant="outline"
			>
				<ToggleGroupItem
					v-for="option in sides"
					:value="option.key"
					:aria-label="option.label"
				>
					<component :is="option.icon" />
					{{ option.label }}
				</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup
				v-model="type"
				variant="outline"
				type="single"
			>
				<ToggleGroupItem
					v-for="option in types"
					:key="option.key"
					:value="option.key"
					:aria-label="option.label"
				>
					<component :is="option.icon" />
					{{ option.label }}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>

		<template v-if="budget">
			<BudgetEditorNode
				hide-children
				muted
				:node="budget"
			/>
			<BudgetEditorNode
				v-for="c in budget.children || []"
				:key="c.id"
				:node="c"
			/>
		</template>
	</PageSection>
</template>
