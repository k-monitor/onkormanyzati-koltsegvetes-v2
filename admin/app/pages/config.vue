<script setup lang="ts">
import { Cog, Download, Upload } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const loading = useLoading();
const serverUrl = useServerUrl();

async function newConfig() {
	if (!confirm('Biztosan felülírod az aktuális konfigot egy új, üres konfiggal?')) return;
	loading.value = 'Új konfig generálása...';
	try {
		await $fetch('/api/newConfig', { method: 'POST' });
		toast.success('Új konfig sikeresen generálva!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült új konfigot generálni.');
	} finally {
		loading.value = false;
	}
}

function uploadConfig(e: Event) {
	upload('/api/config', 'config', e.target as HTMLInputElement);
}
</script>

<template>
	<PageFrame title="Konfiguráció">
		<PageSection>
			<p>
				Feltöltéskor a fájl neve mindegy, a szerveren levő
				<code>config.xlsx</code> fájl lesz felülírva vele. Excel 2007-O365
				(<code>*.xlsx</code>) fájlt kell feltölteni, melynek szerkezete követi a
				dokumentációban írtakat.
			</p>
			<template #actions>
				<Button
					as-child
					variant="secondary"
				>
					<a
						download
						:href="serverUrl('/input/config.xlsx')"
					>
						<Download />
						Letöltés
					</a>
				</Button>
				<Button as-child>
					<label>
						<Upload />
						Feltöltés
						<input
							style="display: none"
							type="file"
							@change="uploadConfig"
						/>
					</label>
				</Button>
			</template>
		</PageSection>
		<PageSection>
			<p>
				Új konfiguráció generálásakor a meglévő felülíródik: minden kézzel beírt érték
				törlődik, és új tooltip munkalapok jönnek létre a <code>budget.xlsx</code>-nek
				megfelelően.
			</p>
			<template #actions>
				<Button
					variant="destructive"
					@click="newConfig"
				>
					<Cog />
					Új konfig
				</Button>
			</template>
		</PageSection>
	</PageFrame>
</template>
