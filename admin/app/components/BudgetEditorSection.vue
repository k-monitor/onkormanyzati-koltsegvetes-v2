<script setup lang="ts">
import {
	ArrowDownToDot,
	ArrowUpFromDot,
	ChartPie,
	CircleAlert,
	Presentation,
} from 'lucide-vue-next';
import { generateEconomicTree, generateFunctionalTree } from '../../../scripts/prepare-data-lib';
import type { BudgetNode } from '../../../src/utils/types';
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

const { emptyFuncTree, workbook, years } = await useBudgetData();

const sheetName = computed(() => {
	const y = years.value?.[year];
	if (!y) return undefined;
	if (side.value === 'income') {
		return y.incomeSheet;
	} else {
		return y.expenseSheet;
	}
});

function prepareEconomicTree(sheetName: string) {
	if (!workbook.value) return;
	const sheet = workbook.value.getWorksheet(sheetName);
	if (!sheet) return;

	return generateEconomicTree(sheet);
}

function prepareFunctionalTree(sheetName: string) {
	if (!emptyFuncTree.value) return;
	if (!workbook.value) return;
	const sheet = workbook.value.getWorksheet(sheetName);
	if (!sheet) return;

	const copyOfEmptyFuncTree = structuredClone(emptyFuncTree.value);
	return generateFunctionalTree(sheet, copyOfEmptyFuncTree);
}

const budget = ref<BudgetNode | null | undefined>();

function updateTree() {
	if (!sheetName.value) return;
	if (type.value === 'econ') {
		budget.value = prepareEconomicTree(sheetName.value);
	} else {
		budget.value = prepareFunctionalTree(sheetName.value);
	}
}

onMounted(() => {
	updateTree();
});

watch([sheetName, type], () => {
	updateTree();
});

const bus = useEventBus(CELL_CHANGED_EVENT);
// called throttled from BudgetEditorNode when input changes
bus.on(() => {
	updateTree();
	// FIXME mark workbook as changed - on input blur?
});

const sheet = computed(() => {
	if (!sheetName.value || !workbook.value) return undefined;
	return workbook.value.getWorksheet(sheetName.value);
});
provide('sheet', sheet);
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
			/>
			<BudgetEditorNode
				v-for="c in budget.children || []"
				:key="c.id"
				:is-editable="type === 'econ'"
				:node="c"
			/>
		</template>
	</div>
</template>
