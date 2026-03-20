<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next';
import type { BudgetNode } from '../../../src/utils/types';

const dialogOpened = ref(false);
const parentNode = ref<BudgetNode | undefined>();
const textarea = ref('');

const bus = useNodeCreatorEvent();
bus.on(({ parentNode: _parentNode }) => {
	parentNode.value = _parentNode;
	textarea.value = '';
	dialogOpened.value = true;
});

const existingChildIds = computed(() => {
	if (!parentNode.value) return [];
	const parentId = String(parentNode.value.id);
	const children = parentNode.value.children || [];
	return children.map((c) => String(c.id)).filter((id) => id.startsWith(parentId));
	// we can only work with the prefixed ID system
	// root nodes have either "B" or "K" virtual IDs
	// so here we filter out F... IDs
});

const DEFAULT_SUB_ID_LENGTH = 2;
const subIdLength = computed(() => {
	const childIds = [...existingChildIds.value];
	if (!childIds.length) return DEFAULT_SUB_ID_LENGTH;
	const lowestChildId: string = childIds.sort((a, b) => a.localeCompare(b))[0]!;
	const trailingZeros = lowestChildId.match(/0*[1-9]$/);
	return trailingZeros ? trailingZeros[0].length : 1;
	// B101 -> children ID = 01 -> subIdLength = 2
	// B11 -> children ID = 1 -> subIdLength = 1
	// B1 -> children ID = 1 -> subIdLength = 1
	// (no children) -> subIdLength = DEFAULT_SUB_ID_LENGTH
});
const newIdMask = computed(() => parentNode.value.id + `0`.repeat(subIdLength.value));

const maxNewChildren = computed(() =>
	subIdLength.value < 1 ? 0 : 10 ** subIdLength.value - existingChildIds.value.length - 1,
);

const nodesToAdd = computed<BudgetNode[]>(() => {
	const lines = textarea.value
		.trim()
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l);
	if (!lines.length) return [];

	const rows = flexiParse(lines).map((r) => {
		const fullName = r.name;
		// if it ends with "([BKF][A-Z0-9]+)$", split it into label and id
		const idMatch = fullName.match(/(.*)\s+\(([BKF][A-Z0-9]+)\)$/);
		return {
			id: idMatch?.[2]?.trim() || '',
			name: idMatch?.[1]?.trim() || fullName,
			amount: r.amount,
		};
	});
	// FIXME generate ids
	return rows
		.map((r) => ({
			id: r.id || 'TODO',
			name: r.name,
			value: r.amount,
		}))
		.slice(0, maxNewChildren.value);
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
						Egy sorban két információt kell feltüntetni: <strong>név és összeg</strong>.
						Ezek sorrendje tetszőleges, az elválasztó karakter <code>|</code>, tabulátor
						vagy <code>;</code> lehet. A program az első sorból állapítja meg a
						formátumot és csak az érvényes sorokat dolgozza fel.
					</p>
					<Textarea v-model="textarea" />
				</div>

				<div class="mb-6">
					<p class="mb-2">
						Az alábbi sorok lesznek hozzáadva (<code>{{ newIdMask }}</code> azonosító
						formátummal, a meglévő {{ existingChildIds.length }} db alkategória után):
					</p>
					<Alert
						v-if="!maxNewChildren"
						class="not-prose mb-8"
						variant="destructive"
					>
						<CircleAlert />
						<AlertTitle
							>Ehhez a szülő kategóriához nem adható újabb alkategória.</AlertTitle
						>
					</Alert>
					<Item
						v-for="(n, i) in nodesToAdd"
						:key="i"
						class="mb-2"
						variant="outline"
					>
						<ItemContent>
							<ItemTitle class="min-w-full">
								<div
									v-if="n.id"
									class="text-muted-foreground text-xs font-bold"
								>
									{{ n.id }}
								</div>
								<div class="grow">{{ n.name }}</div>
							</ItemTitle>
						</ItemContent>
						<ItemActions class="flex flex-col items-end">
							<div class="text-right">
								{{ Number(n.value).toLocaleString('hu') }}
							</div>
						</ItemActions>
					</Item>
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
