<script setup lang="ts">
import type { BudgetNode } from '../../../src/utils/types';

const dialogOpened = ref(false);
const parentNode = ref<BudgetNode | undefined>();

const bus = useNodeCreatorEvent();
bus.on(({ parentNode: _parentNode }) => {
	parentNode.value = _parentNode;
	dialogOpened.value = true;
});

const textarea = ref('');

const nodesToAdd = computed<BudgetNode[]>(() => {
	return [];
});

const canSave = computed(() => nodesToAdd.value.length > 0);

const emit = defineEmits<{
	(e: 'addedNodes'): void;
}>();

function save() {
	console.log('save()');
	// FIXME implement
	emit('addedNodes');
	dialogOpened.value = false;
}
</script>

<template>
	<Dialog v-model:open="dialogOpened">
		<DialogContent
			v-if="parentNode"
			class="sm:max-w-200 [&>button]:cursor-pointer"
		>
			<form @submit.prevent="save">
				<DialogHeader class="mb-4">
					<DialogTitle>Új sorok hozzáadása</DialogTitle>
				</DialogHeader>

				<div class="mb-6">
					<p class="mb-2">Szülő kategória:</p>
					<Item
						class="bg-muted mb-2"
						variant="outline"
					>
						<ItemContent>
							<ItemTitle class="w-full font-bold">
								<div
									v-if="parentNode.id"
									class="text-muted-foreground text-xs font-bold"
								>
									{{ parentNode.id }}
								</div>
								<div class="grow">{{ parentNode.name }}</div>
							</ItemTitle>
						</ItemContent>
						<ItemActions class="flex flex-col items-end">
							<div class="text-right font-bold">
								{{ Number(parentNode.value).toLocaleString('hu') }}
							</div>
						</ItemActions>
					</Item>
				</div>

				<div class="mb-6">
					<p class="mb-2">
						Az alábbi többsoros beviteli mezőbe írhatóak be az új költségvetési sorok.
						Egy sorban két információt kell feltüntetni: név és összeg. Ezek sorrendje
						és az elválasztó karakter is tetszőleges, de a soroknak egységesnek kell
						lenniük.
					</p>
					<Textarea v-model="textarea" />
				</div>

				<div class="mb-6">
					<p class="mb-2">Az alábbi sorok lesznek hozzáadva:</p>
				</div>

				<DialogFooter class="[&>button]:cursor-pointer">
					<DialogClose as-child>
						<Button variant="outline">Mégsem</Button>
					</DialogClose>
					<Button
						:disabled="!canSave"
						type="submit"
						>Mentés</Button
					>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
