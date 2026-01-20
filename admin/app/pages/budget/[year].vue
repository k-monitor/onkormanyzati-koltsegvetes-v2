<script setup lang="ts">
import { Eraser, Undo } from 'lucide-vue-next';

const { data, refresh } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);

const newNameInput = ref(year.value);
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

function resetNewName() {
	newNameInput.value = year.value;
}

const loading = useLoading();
const router = useRouter();

async function handleRename() {
	if (year.value === newYear.value) return;
	if (!confirm('Biztosan átnevezed az évet?')) return;
	loading.value = true;
	try {
		await $fetch('/api/budget/year', {
			method: 'PATCH',
			body: {
				oldName: year.value,
				newName: newYear.value,
			},
		});
		await refresh();
		await router.replace(`/budget/${slugifyYear(newYear.value)}/`);
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
			<p>Év átnevezésekor az alábbi munkalap átnevezések lesznek elvégezve:</p>
			<ul>
				<li>
					<code>{{ year }} BEVÉTEL</code> → <code>{{ newYear }} BEVÉTEL</code>
				</li>
				<li>
					<code>{{ year }} KIADÁS</code> → <code>{{ newYear }} KIADÁS</code>
				</li>
			</ul>
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
									<Undo />
								</button>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</form>
				<Button
					:disabled="year === newYear"
					@click="handleRename"
					>Átnevezés</Button
				>
			</template>
		</PageSection>
	</PageFrame>
</template>
