<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';

const { year } = defineProps<{
	year: string;
}>();

const { refresh } = await useBudgetData();

const loading = useLoading();
const router = useRouter();

async function handleDelete() {
	if (!confirm('Biztosan törlöd az évet? Ez visszavonhatatlan művelet!')) return;
	loading.value = true;
	try {
		await $fetch('/api/budget/year', {
			method: 'DELETE',
			body: {
				name: year,
			},
		});
		await refresh();
		await router.replace('/budget/');
	} catch (e) {
		alert('Nem sikerült! :c');
	} finally {
		loading.value = false;
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
