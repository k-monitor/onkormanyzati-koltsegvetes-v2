<script setup lang="ts">
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
	<h1>Fejlesztéskártyák képei</h1>
	<p>
		A feltöltött fájlok eredeti neve megmarad, a szerveren levő azonos nevű fájl felül lesz
		írva. Egyszerre több fájl is feltölthető. Ajánlott ékezet és szóköz mentes fájlnevekkel
		dolgozni. A konfigban a fájlnevet pontosan kell megadni, mappanevet nem kell eléírni.
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
	<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3 mt-4">
		<div
			class="col"
			v-for="f in ms"
		>
			<div class="card shadow-sm">
				<div class="ratio ratio-16x9">
					<a
						class="card-img-top bg-light d-flex align-items-center justify-content-center thumb"
						:style="{ backgroundImage: 'url(/static/assets/ms/' + f + ')' }"
						:href="'/static/assets/ms/' + f"
						target="_blank"
					>
					</a>
				</div>
				<div class="card-footer d-flex align-items-center px-1">
					<div class="flex-grow-1 text-truncate">{{ f }}</div>
					<button
						class="btn btn-sm btn-danger"
						@click="delMs(f)"
					>
						<i class="fas fa-fw fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
	</div>
	<label class="btn btn-success">
		<i class="fas fa-fw fa-upload me-1"></i>
		Feltöltés
		<input
			style="display: none"
			type="file"
			multiple
			@change="uploadMs"
		/>
	</label>
</template>
