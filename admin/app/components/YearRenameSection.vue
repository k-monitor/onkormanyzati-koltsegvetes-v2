<script setup lang="ts">
import { CircleAlert, Pencil, Undo } from 'lucide-vue-next';

const { year } = defineProps<{
	year: string;
}>();

const { loadBudgetXlsxFromServer, uploadBudgetXlsxToServer, workbook, years } =
	await useBudgetData();

const newNameInput = ref(year);
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

const alreadyExists = computed(
	() => year !== newYear.value && Object.keys(years.value || {}).includes(newYear.value),
);
const canRename = computed(
	() => newYear.value.length >= 4 && year !== newYear.value && !alreadyExists.value,
);

function resetNewName() {
	newNameInput.value = year;
}

const router = useRouter();

async function handleRename() {
	if (!workbook.value) return;
	if (!canRename.value) return;
	if (!confirm('Biztosan átnevezed az évet?')) return;

	try {
		const incomeSheet = years.value?.[year]?.incomeSheet;
		const expenseSheet = years.value?.[year]?.expenseSheet;
		if (!incomeSheet || !expenseSheet) {
			throw new Error('Nem találhatók a munkalapok!');
		}
		renameSheet(workbook.value, incomeSheet, `${newYear.value} BEVÉTEL`);
		renameSheet(workbook.value, expenseSheet, `${newYear.value} KIADÁS`);
		await uploadBudgetXlsxToServer();
		await loadBudgetXlsxFromServer();
		await router.replace(`/budget/${slugifyYear(newYear.value)}/`);
	} catch (e: unknown) {
		console.error(e);
		alert('Nem sikerült! :c');
	}
}
</script>

<template>
	<PageSection>
		<p>Év átnevezésekor az alábbi munkalap átnevezések lesznek elvégezve:</p>
		<ul>
			<li>
				<code>{{ year }} BEVÉTEL</code> → <code>{{ newYear }} BEVÉTEL</code>
			</li>
			<li>
				<code>{{ year }} KIADÁS</code> → <code>{{ newYear }} KIADÁS</code>
			</li>
		</ul>
		<Alert
			v-if="alreadyExists"
			class="not-prose mb-8"
			variant="destructive"
		>
			<CircleAlert />
			<AlertTitle> Ilyen év már létezik! </AlertTitle>
		</Alert>
		<template #actions>
			<form @submit.prevent="handleRename">
				<InputGroup>
					<InputGroupInput
						v-model="newNameInput"
						required
					/>
					<InputGroupAddon align="inline-end">
						<InputGroupButton
							as-child
							variant="secondary"
						>
							<Button
								type="button"
								@click="resetNewName"
							>
								<Undo />
							</Button>
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</form>
			<Button
				:disabled="!canRename"
				@click="handleRename"
			>
				<Pencil />
				Átnevezés
			</Button>
		</template>
	</PageSection>
</template>
