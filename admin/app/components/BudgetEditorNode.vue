<script setup lang="ts">
import { ChevronDown, ChevronRight, Sigma } from 'lucide-vue-next';
import type { BudgetNode } from '../../../src/utils/types';
import { cn } from '~/lib/utils';
import type { Worksheet } from 'exceljs';

const { isSummary, node } = defineProps<{
	node: BudgetNode;
	isEditable?: boolean;
	isSummary?: boolean;
}>();

const canShowChildren = computed(() => {
	return !isSummary && node.children && node.children.length > 0;
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

const open = ref(false);

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
const bus = useEventBus(CELL_CHANGED_EVENT);
watchThrottled(
	inputValue,
	() => {
		if (inputValue.value === undefined) return;
		writeEconValue(node.id || '', node.name || '', inputValue.value);
		bus.emit();
	},
	{
		throttle: 500,
	},
);
</script>

<template>
	<Collapsible v-model:open="open">
		<Item
			class="mb-2"
			:class="cn(isSummary && 'bg-muted')"
			variant="outline"
		>
			<ItemContent>
				<ItemTitle :class="cn(isSummary && 'font-bold')">
					<CollapsibleTrigger
						v-if="!isSummary"
						as-child
					>
						<Button
							class="cursor-pointer"
							:class="cn(!canShowChildren && 'invisible')"
							:disabled="!canShowChildren"
							size="sm"
							variant="ghost"
						>
							<ChevronRight v-if="!open" />
							<ChevronDown v-else />
						</Button>
					</CollapsibleTrigger>
					<div
						v-if="node.id"
						class="text-muted-foreground text-xs font-bold"
					>
						{{ node.id }}
					</div>
					{{ node.name }}
				</ItemTitle>
			</ItemContent>
			<ItemActions class="flex flex-col items-end">
				<div>
					<!-- econ: editable -->
					<NumberField
						v-if="isEditable && node.id"
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
		<CollapsibleContent>
			<div
				v-if="canShowChildren"
				class="mx-8 mb-8"
			>
				<BudgetEditorNode
					v-for="child in node.children"
					:key="child.id"
					:is-editable="isEditable"
					:node="child"
				/>
			</div>
		</CollapsibleContent>
	</Collapsible>
</template>
