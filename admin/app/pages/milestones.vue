<script setup lang="ts">
import { Trash, Upload } from 'lucide-vue-next';

const loading = useLoading();

const ms = ref<string[]>();
async function updateMs() {
	const r = await fetch('/api/ms');
	ms.value = await r.json();
}

async function uploadMs(e: Event) {
	await upload('/api/ms', 'ms', e.target as HTMLInputElement);
	updateMs();
}

async function delMs(f: string) {
	if (!confirm(`Biztosan törlöd ezt a fájlt? (${f})`)) return;
	loading.value = true;
	try {
		await fetch('/api/ms/' + f, { method: 'DELETE' });
		await updateMs();
	} catch {
		alert('Nem sikerült! :C');
	} finally {
		loading.value = false;
	}
}

onMounted(async () => {
	loading.value = true;
	await updateMs();
	loading.value = false;
});
</script>

<template>
	<PageFrame title="Fejlesztéskártyák képei">
		<PageSection>
			<p>
				A feltöltött fájlok eredeti neve megmarad, a szerveren levő azonos nevű fájl felül
				lesz írva. Egyszerre több fájl is feltölthető. Ajánlott ékezet és szóköz mentes
				fájlnevekkel dolgozni. A konfigban a fájlnevet pontosan kell megadni, mappanevet nem
				kell eléírni.
			</p>
			<p>
				A képeket ajánlott feltöltés előtt 1200 pixel szélesre kicsinyíteni arányosan, JPG
				formátumba menteni, és
				<a
					href="https://www.tinyjpg.com/"
					target="_blank"
					>TinyJPG</a
				>
				segítségével optimalizálni.
			</p>
			<template #actions>
				<Button as-child>
					<label>
						<Upload />
						Feltöltés
						<input
							style="display: none"
							type="file"
							multiple
							@change="uploadMs"
						/>
					</label>
				</Button>
			</template>
		</PageSection>
	</PageFrame>

	<div class="container mx-auto my-16 px-16">
		<ItemGroup class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			<Item
				v-for="f in ms"
				:key="f"
				role="listitem"
				variant="outline"
			>
				<ItemHeader>
					<a
						:href="'/static/assets/ms/' + f"
						class="bg-foreground/5 aspect-16/9 w-full rounded-sm"
						style="
							background-position: center;
							background-repeat: no-repeat;
							background-size: cover;
						"
						:style="{
							backgroundImage: 'url(/static/assets/ms/' + f + ')',
						}"
						target="_blank"
						>&nbsp;
					</a>
				</ItemHeader>
				<ItemContent>
					<ItemTitle>{{ f }}</ItemTitle>
				</ItemContent>
				<ItemActions>
					<Button
						variant="destructive"
						@click="delMs(f)"
					>
						<Trash />
					</Button>
				</ItemActions>
			</Item>
		</ItemGroup>
	</div>
</template>
