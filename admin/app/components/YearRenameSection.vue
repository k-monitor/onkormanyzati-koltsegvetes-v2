<script setup lang="ts">
import { CircleAlert, Pencil, Undo } from 'lucide-vue-next';

// TODO LATER should we enforce 4 digits and space prefix?

const { year } = defineProps<{
	year: string;
}>();

const { data, refresh } = await useBudgetData();

const newNameInput = ref(year);
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

const alreadyExists = computed(
	() => year !== newYear.value && getYears(data.value).includes(newYear.value),
);
const canRename = computed(
	() => newYear.value.length >= 4 && year !== newYear.value && !alreadyExists.value,
);

function resetNewName() {
	newNameInput.value = year;
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
				oldName: year,
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
</template>
