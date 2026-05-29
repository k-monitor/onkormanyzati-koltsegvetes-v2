<script setup lang="ts">
import { Download, Undo, Upload } from 'lucide-vue-next';

const serverUrl = useServerUrl();

const { downloadXlsxFromClient, loadBudgetXlsxFromServer, uploadBudgetXlsxToServer } =
	await useBudgetData();
const { isBudgetModified } = useModifications();

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
		<PageSection v-if="isBudgetModified">
			<p class="text-modification *:text-modification">
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
					variant="modification"
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
				<template v-if="isBudgetModified">
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
				szerveren levő változatot. Excel 2007-O365 (*.xlsx) fájlt kell feltölteni, melynek
				szerkezete követi a
				<a
					href="https://github.com/k-monitor/onkormanyzati-koltsegvetes-v2#inputbudgetxlsx"
					target="_blank"
					>dokumentációban</a
				>
				írtakat.
				<strong
					v-if="isBudgetModified"
					class="text-modification"
				>
					A módosításaid el fognak veszni!
				</strong>
			</p>
			<template #actions>
				<Button
					as-child
					:variant="isBudgetModified ? 'destructive' : undefined"
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
