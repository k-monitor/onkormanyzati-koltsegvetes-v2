<script setup lang="ts">
import { CircleAlert, Pencil } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { year } = defineProps<{
	year: string;
}>();

const { loadBudgetXlsxFromServer, uploadBudgetXlsxToServer, workbook, years } =
	await useBudgetData();

const newNameInput = ref(year);
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

const isValid = computed(() => isValidYear(newYear.value));
const alreadyExists = computed(() => Object.keys(years.value || {}).includes(newYear.value));
const canRename = computed(() => isValid.value && year !== newYear.value && !alreadyExists.value);

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
		toast.success('Év sikeresen átnevezve!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült átnevezni az évet.');
	}
}
</script>

<template>
	<PageSection>
		<p>Év átnevezése:</p>
		<NewYearInput
			v-model="newNameInput"
			:default-year="year"
		/>

		<template v-if="canRename">
			<p>Az alábbi munkalap átnevezések lesznek elvégezve:</p>
			<ul>
				<li>
					<code>{{ year }} BEVÉTEL</code> → <code>{{ newYear }} BEVÉTEL</code>
				</li>
				<li>
					<code>{{ year }} KIADÁS</code> → <code>{{ newYear }} KIADÁS</code>
				</li>
			</ul>
		</template>
		<Alert
			v-if="!isValid"
			class="not-prose mb-8"
			variant="destructive"
		>
			<CircleAlert />
			<AlertDescription>Az év elnevezésének 4 számjeggyel kell kezdődnie!</AlertDescription>
		</Alert>
		<Alert
			v-if="alreadyExists"
			class="not-prose mb-8"
			variant="destructive"
		>
			<CircleAlert />
			<AlertDescription>Ilyen év már létezik!</AlertDescription>
		</Alert>
		<template #actions>
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
