<script setup lang="ts">
import { CircleAlert, Plus, Undo } from 'lucide-vue-next';

const { years } = await useBudgetData();

const newNameEl = useTemplateRef('newNameEl');
onMounted(() => {
	newNameEl.value?.$el?.focus();
});

const newNameInput = ref('');
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

const alreadyExists = computed(() => Object.keys(years.value || {}).includes(newYear.value));

function resetNewName() {
	newNameInput.value = '';
}

const canAddNewYear = computed(() => newYear.value.length >= 4 && !alreadyExists.value);

const MODE_EMPTY = 'EMPTY';
const MODE_FULL = 'FULL';
const modeOptions = computed(() => [
	{ value: MODE_EMPTY, label: 'Maradjanak üresen' },
	{ value: MODE_FULL, label: 'Teljes közgazdasági fa 0 értékekkel' },
	...Object.keys(years.value || {})
		.reverse()
		.map((y) => ({
			value: y,
			label: `Másolás innen: ${y}`,
		})),
]);

function handleAdd() {
	if (!canAddNewYear.value) return;

	// FIXME add year to workbook
	// FIXME upload to server
	// FIXME load from server
}
</script>

<template>
	<PageFrame title="Év hozzáadása">
		<form @submit.prevent="handleAdd">
			<PageSection>
				<div class="not-prose mb-4">
					<Label for="newNameEl">Új év elnevezése:</Label>
					<InputGroup>
						<InputGroupInput
							id="newNameEl"
							ref="newNameEl"
							v-model="newNameInput"
							required
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								as-child
								variant="secondary"
							>
								<button
									type="button"
									@click="resetNewName"
								>
									<Undo />
								</button>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</div>
				<Alert
					v-if="alreadyExists"
					class="not-prose mb-8"
					variant="destructive"
				>
					<CircleAlert />
					<AlertTitle>Ilyen év már létezik!</AlertTitle>
				</Alert>

				<p>Az alábbi munkalapok fognak létrejönni a <code>budget.xlsx</code> fájlban:</p>
				<ul>
					<li>
						<code>{{ newYear }} BEVÉTEL</code>
					</li>
					<li>
						<code>{{ newYear }} KIADÁS</code>
					</li>
				</ul>

				<p>Milyen költségvetési sorokkal legyenek feltöltve az új munkalapok?</p>
				<div class="not-prose mb-12">
					<RadioGroup>
						<div
							v-for="o in modeOptions"
							:key="o.value"
							class="flex items-center space-x-2"
						>
							<RadioGroupItem
								:id="o.value"
								:value="o.value"
							/>
							<Label :for="o.value">{{ o.label }}</Label>
						</div>
					</RadioGroup>
				</div>

				<template #actions>
					<Button
						:disabled="!canAddNewYear"
						@click="handleAdd"
					>
						<Plus />
						Hozzáadás
					</Button>
				</template>
			</PageSection>
		</form>
	</PageFrame>
</template>
