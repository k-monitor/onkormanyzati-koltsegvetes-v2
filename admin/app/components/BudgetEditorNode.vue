<script setup lang="ts">
import { throttleFilter } from '@vueuse/core';
import type { Worksheet } from 'exceljs';
import { ChevronDown, ChevronRight, Plus, Sigma, Trash2 } from 'lucide-vue-next';
import type { BudgetNode } from '../../../src/utils/types';
import { cn } from '~/lib/utils';

const { isSummary, node } = defineProps<{
	node: BudgetNode;
	isEditable?: boolean;
	isSummary?: boolean;
}>();

const hasChildren = computed(() => {
	return node.children && node.children.length > 0;
});

const sum = computed(() => {
	if (!node.children) return node.value || 0;
	if (!node.id || String(node.id).startsWith('F')) return node.value || 0; // matching prepare logic
	return node.children.reduce((acc, child) => acc + (child.value || 0), 0);
});

const areChildrenIncomplete = computed(() => {
	if (!node.children) return false;
	return node.children.some((child) => child.name.startsWith('ebből:'));
});

const showChildrenSumWarning = computed(() => {
	if (areChildrenIncomplete.value) {
		return node.value < (sum.value || 0);
	}
	return node.value !== sum.value;
});

const isOpen = ref(isSummary);
const canOpen = computed(() => !isSummary && hasChildren.value);
function open() {
	if (canOpen.value) {
		isOpen.value = !isOpen.value;
	}
}

const sheet = inject<Ref<Worksheet | undefined>>('sheet');

function findEconRow(id: string | number, name: string) {
	if (!sheet?.value) return null;
	for (let ri = 3; ri <= sheet.value.rowCount; ri++) {
		// index is 1-based, header is at least 2 rows
		const row = sheet.value.getRow(ri);
		const cellValue = (row.getCell(2).value?.toString() || '').trim();
		if (name.startsWith('ebből:')) {
			// "ebből:" rows have IDs of their parent in the input
			// but we have "ID:index" ID for them after preparation
			const parentId = String(id).split(':')[0];
			const needle = `(${parentId})`;
			if (cellValue.startsWith(name) && cellValue.endsWith(needle)) {
				return row;
			}
		} else {
			const needle = `(${id})`;
			if (cellValue.endsWith(needle)) {
				return row;
			}
		}
	}
	return null;
}

function readEconValue(id: string | number, name: string) {
	const row = findEconRow(id, name);
	if (!row) return undefined;
	const valueCell = row.getCell(3);
	const rawValue = (valueCell.result || valueCell.value)?.toString() || '';
	return Number(rawValue.replace(/[^0-9-]+/g, ''));
}

function writeEconValue(id: string | number, name: string, value: number) {
	const row = findEconRow(id, name);
	if (!row) return;
	const valueCell = row.getCell(3);
	valueCell.value = value;
}

const inputValue = ref(readEconValue(node.id || '', node.name || ''));
const bus = useCellChangedEvent();
const { ignoreUpdates } = watchIgnorable(
	inputValue,
	() => {
		if (inputValue.value === undefined) return;
		writeEconValue(node.id || '', node.name || '', inputValue.value);
		bus.emit();
	},
	{
		eventFilter: throttleFilter(500),
	},
);

const { workbook } = await useBudgetData();
watch(workbook, () => {
	// file reloaded, e.g. on revert
	ignoreUpdates(() => {
		inputValue.value = readEconValue(node.id || '', node.name || '');
	});
});

const nodeCreatorBus = useNodeCreatorEvent();
function handleAdd() {
	nodeCreatorBus.emit({ parentNode: node, sheet: sheet?.value });
}

const canBeDeleted = computed(() => (node.children || []).length === 0);
function handleDelete() {
	if (!sheet?.value) return;
	if (!canBeDeleted.value) return;
	if (!confirm('Biztosan törlöd a sort?')) return;

	const row = findEconRow(node.id || '', node.name || '');
	if (row) {
		sheet.value.spliceRows(row.number, 1);
		bus.emit();
	}
}
</script>

<template>
	<Collapsible v-model:open="isOpen">
		<Item
			class="mb-2 py-0"
			:class="cn(isSummary && 'bg-muted')"
			variant="outline"
		>
			<ItemContent
				class="cursor-pointer py-4"
				@click="open"
			>
				<ItemTitle :class="cn('w-full', isSummary && 'font-bold')">
					<div
						v-if="!isSummary"
						:class="cn('*:size-4', !canOpen && 'invisible')"
					>
						<ChevronRight v-if="!isOpen" />
						<ChevronDown v-else />
					</div>
					<div
						v-if="node.id && !isSummary"
						class="text-muted-foreground text-xs font-bold"
					>
						{{ node.id }}
					</div>
					<div class="grow">{{ node.name }}</div>
				</ItemTitle>
			</ItemContent>
			<ItemActions class="flex gap-2 py-2">
				<Button
					v-if="!node.children?.length && isEditable"
					class="cursor-pointer"
					size="sm"
					variant="secondary"
					@click="handleAdd"
				>
					<Plus /> Alábontás
				</Button>
				<Button
					v-if="canBeDeleted && isEditable"
					class="cursor-pointer"
					size="sm"
					variant="destructive"
					@click="handleDelete"
				>
					<Trash2 />
				</Button>
				<div class="flex flex-col items-end">
					<!-- econ: editable -->
					<NumberField
						v-if="isEditable && node.id && !isSummary"
						v-model="inputValue"
						locale="hu"
						:min="0"
					>
						<NumberFieldContent>
							<NumberFieldDecrement />
							<NumberFieldInput />
							<NumberFieldIncrement />
						</NumberFieldContent>
						<div
							v-if="showChildrenSumWarning"
							class="text-destructive relative flex items-center justify-center gap-3"
						>
							<Sigma class="absolute left-0 ml-4 size-4" />
							{{ Number(sum).toLocaleString('hu') }}
						</div>
					</NumberField>
					<!-- summary row & func: not editable -->
					<div
						v-else
						:class="cn('text-right', isSummary && 'font-bold')"
					>
						{{ Number(node.value).toLocaleString('hu') }}
						<div
							v-if="showChildrenSumWarning"
							class="text-destructive flex items-center justify-center gap-3"
						>
							<Sigma class="size-4" />
							{{ Number(sum).toLocaleString('hu') }}
						</div>
					</div>
				</div>
			</ItemActions>
		</Item>
		<CollapsibleContent
			v-if="hasChildren"
			:class="cn('mb-8', isSummary || 'mx-8')"
		>
			<BudgetEditorNode
				v-for="child in node.children"
				:key="child.id"
				:is-editable="isEditable"
				:node="child"
			/>
			<Item
				v-if="isEditable"
				class="-mt-2"
			>
				<Button
					class="cursor-pointer"
					variant="secondary"
					@click="handleAdd"
				>
					<Plus /> Új sor
				</Button>
			</Item>
		</CollapsibleContent>
	</Collapsible>
</template>
