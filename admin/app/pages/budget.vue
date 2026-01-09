<script setup lang="ts">
import { Download, Upload } from 'lucide-vue-next';

function uploadBudget(e: Event) {
	upload('/api/budget', 'budget', e.target as HTMLInputElement);
}
</script>

<template>
	<main class="prose mx-auto my-16">
		<h1>Költségvetés</h1>

		<p>
			Feltöltéskor a fájl neve mindegy, a szerveren levő
			<code>budget.xlsx</code> fájl lesz felülírva vele. Excel 2007-O365 (<code>*.xlsx</code>)
			fájlt kell feltölteni, melynek szerkezete követi a dokumentációban írtakat.
		</p>
		<div class="not-prose flex gap-8">
			<Button
				as-child
				variant="secondary"
			>
				<a
					download
					href="/input/budget.xlsx"
				>
					<Download />
					Letöltés
				</a>
			</Button>

			<Button as-child>
				<label class="cursor-pointer">
					<Upload />
					Feltöltés
					<input
						style="display: none"
						type="file"
						@change="uploadBudget"
					/>
				</label>
			</Button>
		</div>
	</main>
</template>
