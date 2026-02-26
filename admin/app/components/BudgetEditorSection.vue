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

const { emptyFuncTree, markModified, workbook, years } = await useBudgetData();

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

const econTree = ref<BudgetNode | null | undefined>();
const funcTree = computed(() =>
	sheetName.value ? prepareFunctionalTree(sheetName.value) : undefined,
);
const visibleTree = computed(() => {
	if (type.value === 'econ') {
		return econTree.value;
	} else {
		return funcTree.value;
	}
});

function updateEconTree() {
	if (!sheetName.value) return;
	econTree.value = prepareEconomicTree(sheetName.value);
}

onMounted(() => {
	// init
	updateEconTree();
});

watch(sheetName, () => {
	// side changed
	updateEconTree();
});

const bus = useEventBus(CELL_CHANGED_EVENT); // called throttled from BudgetEditorNode
bus.on(() => {
	// values changed
	updateEconTree();
	markModified();
});

const sheet = computed(() => {
	if (!sheetName.value || !workbook.value) return undefined;
	return workbook.value.getWorksheet(sheetName.value);
});
provide('sheet', sheet);

const isEconAndFuncTotalDiffer = computed(() => {
	if (!econTree.value || !funcTree.value) return false;
	return econTree.value.value !== funcTree.value.value;
});
</script>

<template>
	<PageSection class="-mb-8 border-none pb-0!">
		<p>
			Az alábbiakban meg tudod tekinteni a költségvetési adatokat, és a közgazdasági bontást
			lehetőséged van szerkeszteni. A beviteli mezők a rovatkódnak (pl. B1) megfelelő cellát
			módosítják az Excel munkalapon. A főösszeget a program számolja és nem írja ki Excel-be,
			az "F" betűvel kezdőd rovatkódok értékei nem számítanak bele.
		</p>
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
			v-if="!visibleTree"
			class="not-prose mb-8"
			variant="destructive"
		>
			<CircleAlert />
			<AlertTitle>A <code>budget.xlsx</code> fájlban nincs ilyen adat jelenleg.</AlertTitle>
		</Alert>
		<Alert
			v-if="isEconAndFuncTotalDiffer"
			class="not-prose mb-8"
			variant="destructive"
		>
			<CircleAlert />
			<AlertTitle>A közgazdasági és funkcionális főösszeg nem egyezik meg.</AlertTitle>
		</Alert>
	</PageSection>

	<div class="prose mx-auto w-full px-4 lg:max-w-[90%] lg:px-0">
		<template v-if="visibleTree">
			<BudgetEditorNode
				is-summary
				:node="visibleTree"
			/>
			<BudgetEditorNode
				v-for="c in visibleTree.children || []"
				:key="c.id"
				:is-editable="type === 'econ'"
				:node="c"
			/>
		</template>
	</div>
</template>
