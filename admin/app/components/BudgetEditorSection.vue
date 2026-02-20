<script setup lang="ts">
import {
	ArrowDownToDot,
	ArrowUpFromDot,
	ChartPie,
	CircleAlert,
	Presentation,
} from 'lucide-vue-next';
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
	<PageSection class="-mb-8 border-none pb-0!">
		<div class="mb-8 flex flex-wrap justify-between gap-4">
			<ToggleGroup
				v-model="side"
				type="single"
				variant="outline"
			>
				<ToggleGroupItem
					v-for="option in sides"
					:key="option.key"
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
		<Alert
			v-if="!budget"
			class="not-prose"
			variant="destructive"
		>
			<CircleAlert />
			<AlertTitle>A <code>budget.xlsx</code> fájlban nincs ilyen adat jelenleg.</AlertTitle>
		</Alert>
	</PageSection>

	<div class="prose mx-auto w-full px-4 lg:max-w-[90%] lg:px-0">
		<template v-if="budget">
			<BudgetEditorNode
				is-summary
				:node="budget"
				:side="side"
				:year="year"
			/>
			<BudgetEditorNode
				v-for="c in budget.children || []"
				:key="c.id"
				:node="c"
				:side="side"
				:year="year"
			/>
		</template>
	</div>
</template>
