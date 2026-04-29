<script setup lang="ts">
import type { Worksheet } from 'exceljs';
import { CircleAlert } from 'lucide-vue-next';
import type { BudgetNode } from '../../../src/utils/types';
import { parseEconomicDescriptor } from '../../../scripts/prepare-data-lib';

const dialogOpened = ref(false);
const parentNode = ref<BudgetNode | undefined>();
const sheet = ref<Worksheet | undefined>();
const textarea = ref('');

const bus = useNodeCreatorEvent();
bus.on(({ parentNode: _parentNode, sheet: _sheet }) => {
	if (!_sheet) {
		console.error('No sheet provided in creator event.');
		return;
	}
	parentNode.value = _parentNode;
	sheet.value = _sheet;
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

const parsedInputRows = computed<BudgetNode[]>(() => {
	const lines = textarea.value
		.trim()
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l);
	return flexiParse(lines).map((r) => {
		const fullName = r.name;
		const { id, name } = parseEconomicDescriptor(fullName);
		return {
			id: id || '',
			name: name,
			value: r.amount,
		};
	});
});

const subIdLength = computed(() => {
	// TODO LATER move to util, write test cases
	if (existingChildIds.value.length) {
		// if there are children, they dictate ID length
		const childIds = [...existingChildIds.value];
		const lowestChildId: string = childIds.sort((a, b) => a.localeCompare(b))[0]!;
		const trailingZeros = lowestChildId.match(/0*[1-9]$/);
		return trailingZeros ? trailingZeros[0].length : 1;
		// B101 -> children ID = 01 -> subIdLength = 2
		// B11 -> children ID = 1 -> subIdLength = 1
		// B1 -> children ID = 1 -> subIdLength = 1
	}

	// default is 1 digit for top level, 2 digit under that
	const defaultSubIdLength = String(parentNode.value?.id).length === 1 ? 1 : 2;

	// if there are no children, input can dictate ID length
	const parentId = String(parentNode.value?.id || '');
	const firstInputId = String(parsedInputRows.value.find((r) => r.id)?.id || '');
	if (!firstInputId) return defaultSubIdLength; // no input ID
	return Math.max(1, firstInputId.length - parentId.length);
	// here we need the sub ID length only, e.g. B101 - B1 = 2
});

const newIdMask = computed(() =>
	parentNode.value ? parentNode.value.id + '0'.repeat(subIdLength.value) : '',
);

const maxNewChildren = computed(() =>
	subIdLength.value < 1 ? 0 : 10 ** subIdLength.value - existingChildIds.value.length - 1,
);

const nodesToAdd = computed<BudgetNode[]>(() => {
	return fillIds(
		parsedInputRows.value,
		existingChildIds.value,
		'' + (parentNode.value?.id || ''),
		subIdLength.value,
		maxNewChildren.value,
	);
});

const canSave = computed(() => nodesToAdd.value.length > 0);

function findLastEconRowIndex(id: string) {
	if (!sheet.value) return -1;
	let ri = sheet.value.rowCount;
	for (; ri >= 3; ri--) {
		const row = sheet.value.getRow(ri);
		const cellValue = (row.getCell(2).value?.toString() || '').trim();
		const needle = `(${id})`;
		if (cellValue.endsWith(needle)) {
			return ri;
		}
	}
	return -1;
}

const emit = defineEmits<{
	(e: 'addedNodes'): void;
}>();

function save() {
	if (!sheet.value || !parentNode.value) return;

	const lastChildId = existingChildIds.value.slice(-1)[0] || String(parentNode.value.id || '');

	let ri = findLastEconRowIndex(lastChildId);
	if (ri === -1 || !lastChildId) {
		console.warn('Could not find last child row in sheet, appending to the end.');
		ri = sheet.value.rowCount;
	}

	sheet.value.insertRows(
		ri + 1,
		nodesToAdd.value.map((n) => [99, n.name + ` (${n.id})`, n.value]),
	);

	emit('addedNodes');
	dialogOpened.value = false;
}
</script>

<template>
	<Dialog v-model:open="dialogOpened">
		<DialogContent
			v-if="parentNode"
			class="flex max-h-[80vh] flex-col sm:max-w-200 [&>button]:cursor-pointer"
		>
			<form
				class="flex min-h-0 flex-1 flex-col"
				@submit.prevent="save"
			>
				<DialogHeader class="mb-4">
					<DialogTitle>Új sorok hozzáadása</DialogTitle>
				</DialogHeader>

				<div class="mb-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-8">
					<div>
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
							Az alábbi többsoros beviteli mezőbe írhatóak be az új költségvetési
							sorok. Egy sorban két információt kell feltüntetni:
							<strong>név és összeg</strong>. Ezek sorrendje tetszőleges, az
							elválasztó karakter <code>|</code>, tabulátor vagy <code>;</code> lehet.
							A program az első sorból állapítja meg a formátumot és csak az érvényes
							sorokat dolgozza fel. A név végén opcionálisan szerepelhet azonosító is,
							zárójelben (pl. <code>Alkategória neve (B101)</code>), hosszának
							egyeznie kell már meglévő alkategóriák azonosítóival.
						</p>
						<Textarea v-model="textarea" />
					</div>
					<div>
						<p class="mb-2">
							Az alábbi sorok lesznek hozzáadva (<code>{{ newIdMask }}</code>
							azonosító formátummal, a meglévő {{ existingChildIds.length }} db
							alkategória után):
						</p>
						<Alert
							v-if="!maxNewChildren"
							class="not-prose mb-8"
							variant="destructive"
						>
							<CircleAlert />
							<AlertDescription>
								Ehhez a szülő kategóriához nem adható újabb alkategória.
							</AlertDescription>
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
