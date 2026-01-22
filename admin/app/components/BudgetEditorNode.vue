<script setup lang="ts">
import { cn } from '~/lib/utils';
import type { BudgetNode } from '../../../src/utils/types';

defineProps<{
	node: BudgetNode;
	hideChildren?: boolean;
	muted?: boolean;
}>();
</script>

<template>
	<Item
		class="mb-2"
		:class="cn(muted && 'bg-muted')"
		variant="outline"
	>
		<ItemContent>
			<ItemTitle :class="cn(muted && 'font-bold')">
				<div
					v-if="node.id"
					class="text-foreground-muted text-xs"
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
	<div
		v-if="!hideChildren && node.children"
		class="ml-8"
	>
		<BudgetEditorNode
			v-for="child in node.children"
			:key="child.id"
			:node="child"
		/>
	</div>
</template>
