<script setup lang="ts">
async function newConfig() {
	if (!confirm('Biztosan felülírod az aktuális konfigot egy új, üres konfiggal?')) return;
	// FIXME admin loading
	//this.loading = 'Új konfig generálása...';
	try {
		await fetch('/api/newConfig', { method: 'POST' });
	} catch {
		alert('Nem sikerült! :C');
	} finally {
		//this.loading = false;
	}
}

function uploadConfig(e: Event) {
	upload('/api/config', 'config', e.target as HTMLInputElement);
}
</script>

<template>
	<h1>Konfiguráció</h1>
	<p>
		Új konfiguráció generálásakor a meglévő felülíródik: minden kézzel beírt érték törlődik, és
		új tooltip munkalapok jönnek létre a <code>budget.xlsx</code>-nek megfelelően.
	</p>
	<p>
		Feltöltéskor a fájl neve mindegy, a szerveren levő
		<code>config.xlsx</code> fájl lesz felülírva vele. Excel 2007-O365 (<code>*.xlsx</code>)
		fájlt kell feltölteni, melynek szerkezete követi a dokumentációban írtakat.
	</p>
	<button
		class="btn btn-danger"
		@click="newConfig"
	>
		<i class="fas fa-fw fa-cog me-1"></i>
		Új konfig
	</button>
	<a
		class="btn btn-primary"
		href="/input/config.xlsx"
		target="_blank"
	>
		<i class="fas fa-fw fa-download me-1"></i>
		Letöltés
	</a>
	<label class="btn btn-success">
		<i class="fas fa-fw fa-upload me-1"></i>
		Feltöltés
		<input
			style="display: none"
			type="file"
			@change="uploadConfig"
		/>
	</label>
</template>
