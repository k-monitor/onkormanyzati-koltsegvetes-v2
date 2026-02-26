<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next';

const { isModified, loadBudgetXlsxFromServer, uploadBudgetXlsxToServer } = await useBudgetData();
async function save() {
	if (!isModified.value) return;
	try {
		await uploadBudgetXlsxToServer();
		await loadBudgetXlsxFromServer();
	} catch (e: unknown) {
		console.error(e);
		alert('Nem sikerült! :c');
	}
}
</script>

<template>
	<div
		v-if="isModified"
		class="sticky bottom-0 flex items-center justify-between gap-4 border-t border-b bg-white px-4 py-0!"
	>
		<Alert
			v-if="isModified"
			class="border-0 bg-transparent"
			variant="destructive"
		>
			<CircleAlert />
			<AlertTitle>Nem mentett költségvetés módosítások!</AlertTitle>
			<AlertDescription class="max-w-[80ch]">
				Ha nem mented őket a szerverre, akkor a KÖKÖ&nbsp;Admin bezárása vagy újratöltése
				esetén elvesznek.
			</AlertDescription>
		</Alert>
		<Button @click="save">Mentés</Button>
	</div>
</template>
