<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { isModified, loadBudgetXlsxFromServer, uploadBudgetXlsxToServer } = await useBudgetData();

function revertChanges() {
	if (!confirm('Biztosan el akarod vetni a módosításokat?')) return;
	return loadBudgetXlsxFromServer();
}

async function save() {
	if (!isModified.value) return;
	try {
		await uploadBudgetXlsxToServer();
		await loadBudgetXlsxFromServer();
		toast.success('Költségvetés sikeresen elmentve!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült elmenteni a költségvetést.');
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
			<AlertTitle>Nem mentett költségvetés módosítások</AlertTitle>
			<AlertDescription class="___max-w-[80ch]">
				<span>
					Ha nem mented őket a szerverre, akkor elveszhetnek!
					<NuxtLink
						class="font-bold underline"
						to="/budget/"
						>Részletek</NuxtLink
					>
				</span>
			</AlertDescription>
		</Alert>
		<Button
			variant="destructive"
			@click="revertChanges"
			>Elvetés</Button
		>
		<Button @click="save">Mentés</Button>
	</div>
</template>
