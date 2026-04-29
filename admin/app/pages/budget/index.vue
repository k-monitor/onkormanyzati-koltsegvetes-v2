<script setup lang="ts">
import { Download, Undo, Upload } from 'lucide-vue-next';

const serverUrl = useServerUrl();

const { downloadXlsxFromClient, isModified, loadBudgetXlsxFromServer, uploadBudgetXlsxToServer } =
	await useBudgetData();

function revertChanges() {
	if (!confirm('Biztosan el akarod vetni a módosításokat?')) return;
	return loadBudgetXlsxFromServer();
}

async function uploadBudget(e: Event) {
	await upload('/api/budget', 'budget', e.target as HTMLInputElement);
	await loadBudgetXlsxFromServer();
}

async function save() {
	await uploadBudgetXlsxToServer();
	await loadBudgetXlsxFromServer();
}
</script>

<template>
	<PageFrame title="Költségvetés">
		<PageSection v-if="isModified">
			<p class="text-destructive *:text-destructive">
				<strong>A költségvetés módosult, de még nem lett mentve</strong>
				(feltöltve) a szerveren levő <code>budget.xlsx</code> fájlba. A módosítások
				elvesznek a böngészőlap bezárásakor, újratöltésekor, új költségvetés feltöltésekor,
				valamint évek hozzáadása, átnevezése vagy törlése esetén.
			</p>
			<template #actions>
				<Button
					variant="secondary"
					@click="downloadXlsxFromClient"
				>
					<Download />
					Letöltés
				</Button>
				<Button @click="save">
					<Upload />
					Mentés
				</Button>
				<Button
					class="ml-auto"
					variant="destructive"
					@click="revertChanges"
				>
					<Undo />
					Elvetés
				</Button>
			</template>
		</PageSection>
		<PageSection>
			<p>
				Itt tudod letölteni a szerveren levő <code>budget.xlsx</code> fájlt.
				<template v-if="isModified">
					Ez nem tartalmazza az admin felületen végzett és még nem mentett módosításokat.
				</template>
			</p>
			<template #actions>
				<Button
					as-child
					variant="secondary"
				>
					<a
						download
						:href="serverUrl('/input/budget.xlsx')"
					>
						<Download />
						Letöltés
					</a>
				</Button>
			</template>
		</PageSection>
		<PageSection>
			<p>
				Az alábbi gombbal tudsz feltölteni új <code>budget.xlsx</code> fájlt, felülírva a
				szerveren levő változatot.
				<strong
					v-if="isModified"
					class="text-destructive"
				>
					A módosításaid el fognak veszni!
				</strong>
				Excel 2007-O365 (<code>*.xlsx</code>) fájlt kell feltölteni, melynek szerkezete
				követi a dokumentációban írtakat.
			</p>
			<template #actions>
				<Button
					as-child
					:variant="isModified ? 'destructive' : undefined"
				>
					<label>
						<Upload />
						Feltöltés
						<input
							style="display: none"
							type="file"
							@change="uploadBudget"
						/>
					</label>
				</Button>
			</template>
		</PageSection>
	</PageFrame>
</template>
