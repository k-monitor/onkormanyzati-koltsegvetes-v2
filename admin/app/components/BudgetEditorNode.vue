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
	return node.children.reduce((acc, child) => acc + (child.value || 0), 0);
});

const open = ref(false);

const sheet = inject<Ref<Worksheet | undefined>>('sheet');

function findEconRow(nodeId: string | number) {
	if (!sheet?.value) return null;
	for (let ri = 3; ri <= sheet.value.rowCount; ri++) {
		// index is 1-based, header is at least 2 rows
		const row = sheet.value.getRow(ri);
		const cellValue = row.getCell(2).value?.toString() || '';
		const needle = `(${nodeId})`;
		if (cellValue.includes(needle)) {
			return row;
		}
	}
	return null;
}

function readEconValue(nodeId: string | number) {
	const row = findEconRow(nodeId);
	if (!row) return undefined;
	const valueCell = row.getCell(3);
	const rawValue = (valueCell.result || valueCell.value)?.toString() || '';
	return Number(rawValue.replace(/[^0-9-]+/g, ''));
}

function writeEconValue(nodeId: string | number, value: number) {
	const row = findEconRow(nodeId);
	if (!row) return;
	const valueCell = row.getCell(3);
	valueCell.value = value;
}

const inputValue = ref(readEconValue(node.id || ''));
const bus = useEventBus(CELL_CHANGED_EVENT);
watchThrottled(
	inputValue,
	() => {
		if (inputValue.value === undefined) return;
		writeEconValue(node.id || '', inputValue.value);
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
					<Input
						v-if="isEditable && node.id"
						v-model="inputValue"
						class="text-right"
						type="number"
					/>
					<div v-else>{{ node.value }}</div>
				</div>
				<div
					v-if="node.value !== sum"
					:class="cn('text-destructive flex gap-4', isEditable && 'pr-8')"
				>
					<Sigma class="size-5" />
					{{ sum }}
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
