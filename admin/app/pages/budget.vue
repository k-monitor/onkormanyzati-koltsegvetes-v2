<script setup lang="ts">
function uploadBudget(e: Event) {
	upload('/api/budget', 'budget', e.target as HTMLInputElement);
}
</script>

<template>
	<h1>Költségvetés</h1>
	<p>
		Feltöltéskor a fájl neve mindegy, a szerveren levő
		<code>budget.xlsx</code> fájl lesz felülírva vele. Excel 2007-O365 (<code>*.xlsx</code>)
		fájlt kell feltölteni, melynek szerkezete követi a dokumentációban írtakat.
	</p>
	<a
		class="btn btn-outline-primary"
		href="/input/budget.xlsx"
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
			@change="uploadBudget"
		/>
	</label>
</template>
