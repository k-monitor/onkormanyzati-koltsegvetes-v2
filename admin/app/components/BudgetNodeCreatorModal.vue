<script setup lang="ts">
import type { BudgetNode } from '../../../src/utils/types';

const dialogOpened = ref(false);
const node = ref<BudgetNode | undefined>();
const bus = useNodeCreatorEventBus();
bus.on(({ parentNode }) => {
	node.value = parentNode;
	dialogOpened.value = true;
});
</script>

<template>
	<Dialog v-model:open="dialogOpened">
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Új sor hozzáadása</DialogTitle>
				<DialogDescription>
					Make changes to your profile here. Click save when you're done.
				</DialogDescription>
			</DialogHeader>
			<p>TODO szülő node-ról infó</p>
			<p>TODO terv szerinti form & live preview</p>
			<DialogFooter>
				<DialogClose as-child>
					<Button variant="outline"> Cancel </Button>
				</DialogClose>
				<Button type="submit"> Save changes </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
