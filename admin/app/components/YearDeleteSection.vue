<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { year } = defineProps<{
	year: string;
}>();

const { loadBudgetXlsxFromServer, uploadBudgetXlsxToServer, workbook, years } =
	await useBudgetData();

const router = useRouter();

async function handleDelete() {
	if (!workbook.value) return;
	if (!confirm('Biztosan törlöd az évet? Ez visszavonhatatlan művelet!')) return;

	try {
		const incomeSheet = years.value?.[year]?.incomeSheet;
		const expenseSheet = years.value?.[year]?.expenseSheet;
		if (!incomeSheet || !expenseSheet) {
			throw new Error('Nem találhatók a munkalapok!');
		}
		deleteSheet(workbook.value, incomeSheet);
		deleteSheet(workbook.value, expenseSheet);
		await uploadBudgetXlsxToServer();
		await loadBudgetXlsxFromServer();
		await router.replace('/budget/');
		toast.success('Év sikeresen törölve!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült törölni az évet.');
	}
}
</script>

<template>
	<PageSection>
		<p>Év törlésekor az alábbi munkalapok lesznek eltávolítva:</p>
		<ul>
			<li>
				<code>{{ year }} BEVÉTEL</code>
			</li>
			<li>
				<code>{{ year }} KIADÁS</code>
			</li>
		</ul>
		<template #actions>
			<Button
				variant="destructive"
				@click="handleDelete"
			>
				<Trash2 />
				Törlés
			</Button>
		</template>
	</PageSection>
</template>
