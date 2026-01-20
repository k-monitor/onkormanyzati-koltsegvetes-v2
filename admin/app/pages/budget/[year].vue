<script setup lang="ts">
// TODO LATER should we enforce 4 digits and space prefix?
// TODO LATER we can actually see if newYear already exists
// TODO LATER replace confirm with AlertDialog

import { Pencil, Trash2, Undo } from 'lucide-vue-next';

const { data, refresh } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);

const newNameInput = ref(year.value);
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());
const alreadyExists = computed(
	() => year.value !== newYear.value && getYears(data.value).includes(newYear.value),
);
const canRename = computed(
	() => newYear.value.length > 4 && year.value !== newYear.value && !alreadyExists.value,
);

function resetNewName() {
	newNameInput.value = year.value;
}

const loading = useLoading();
const router = useRouter();

async function handleRename() {
	if (!canRename.value) return;
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

async function handleDelete() {
	if (!confirm('Biztosan törlöd az évet? Ez visszavonhatatlan művelet!')) return;
	loading.value = true;
	try {
		await $fetch('/api/budget/year', {
			method: 'DELETE',
			body: {
				name: year.value,
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
			<p
				v-if="alreadyExists"
				class="text-destructive"
			>
				Ilyen év már létezik!
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
									<Undo />
								</button>
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
	</PageFrame>
</template>
