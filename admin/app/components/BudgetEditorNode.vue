<script setup lang="ts">
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import type { BudgetNode } from '../../../src/utils/types';
import { cn } from '~/lib/utils';
import type { Worksheet } from 'exceljs';

const { isSummary, node } = defineProps<{
	node: BudgetNode;
	isSummary?: boolean;
}>();

const canShowChildren = computed(() => {
	return !isSummary && node.children && node.children.length > 0;
});

const open = ref(false);

const sheet = inject<Worksheet | undefined>('sheet');

// FIXME implement node input read/write

/*
const { workbook } = await useBudgetData();

function findEconRow(sheet: ExcelJS.Worksheet, nodeId: string | number) {
	for (let ri = 3; ri <= sheet.rowCount; ri++) {
		// index is 1-based, header is at least 2 rows
		const row = sheet.getRow(ri);
		const cellValue = row.getCell(2).value?.toString() || '';
		const needle = `(${nodeId})`;
		if (cellValue.includes(needle)) {
			return row;
		}
		// FIXME currently only finds top level nodes
	}
	return null;
}

function readEconValue(year: string, side: 'income' | 'expense', nodeId: string | number) {
	const sheet = findSheet(year, side);
	if (!sheet) return null;
	const row = findEconRow(sheet, nodeId);
	if (!row) return null;
	const valueCell = row.getCell(3);
	const rawValue = (valueCell.result || valueCell.value)?.toString() || '';
	return Number(rawValue.replace(/[^0-9-]+/g, ''));
}

function writeEconValue(
	year: string,
	side: 'income' | 'expense',
	nodeId: string | number,
	value: number,
) {
	const sheet = findSheet(year, side);
	if (!sheet) return;
	const row = findEconRow(sheet, nodeId);
	if (!row) return;
	const valueCell = row.getCell(3);
	valueCell.value = value;
}*/
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
				<!-- <ItemDescription>{{ node.id }}</ItemDescription> -->
			</ItemContent>
			<ItemActions>
				{{ node.value }}
				<!-- <Input
					type="number"
					:value="readEconValue(year, side, node.id)"
				/> -->
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
					:node="child"
				/>
			</div>
		</CollapsibleContent>
	</Collapsible>
</template>
