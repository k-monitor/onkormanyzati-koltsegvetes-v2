<script setup lang="ts">
import { Eraser } from 'lucide-vue-next';

const { data, refresh } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);

const newNameInput = ref(year.value);

function resetNewName() {
	newNameInput.value = year.value;
}

const loading = useLoading();
const router = useRouter();

async function handleRename() {
	if (!confirm('Biztosan átnevezed az évet?')) return;
	loading.value = true;
	try {
		await $fetch('/api/budget/year', {
			method: 'PATCH',
			body: {
				oldName: year.value,
				newName: newNameInput.value,
			},
		});
		await refresh();
		await router.replace(`/budget/${slugifyYear(newNameInput.value)}/`);
	} catch (e) {
		alert('Nem sikerült! :c');
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	>
		<PageSection>
			<p>
				Az itt végzett és elmentett módosítások során a <code>budget.xlsx</code> fájl újra
				lesz építve, melynek során a program csak az adatokat tudja megőrizni, a formázást
				és egyéb Excel funkciókat nem - ezek elveszhetnek.
			</p>
		</PageSection>
		<PageSection>
			<p>
				Év átnevezésekor a kiválasztott évhez tartozó bevétel és kiadás munkalapok nevei
				módosulnak.
			</p>
			<template #actions>
				<form @submit.prevent="handleRename">
					<InputGroup>
						<InputGroupInput v-model="newNameInput" />
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								as-child
								variant="secondary"
							>
								<button
									type="button"
									@click="resetNewName"
								>
									<Eraser />
								</button>
							</InputGroupButton>
							<InputGroupButton
								as-child
								variant="destructive"
							>
								<button type="submit">Átnevezés</button>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</form>
			</template>
		</PageSection>
	</PageFrame>
</template>
