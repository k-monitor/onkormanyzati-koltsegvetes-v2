<script setup lang="ts">
import { cn } from '~/lib/utils';
import type { BudgetNode } from '../../../src/utils/types';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';

const { isSummary, node } = defineProps<{
	node: BudgetNode;
	isSummary?: boolean;
}>();

const canShowChildren = computed(() => {
	return !isSummary && node.children && node.children.length > 0;
});

const open = ref(false);
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
