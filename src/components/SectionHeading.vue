<script setup lang="ts">
const { title, year } = defineProps<{ title: string; year: string }>();

const years = computed(() => Object.keys(DATA).sort());
const index = computed(() => years.value.indexOf(year));

const { handleYearSelected } = useYear();
</script>

<template>
	<h2>
		{{ title }}
		<small class="ml-3 text-muted">
			<i
				v-if="DATA[years[index - 1] || '']"
				class="fas fa-caret-left"
				@click="handleYearSelected(years[index - 1] || '')"
			/>
			{{ year }}
			<i
				v-if="DATA[years[index + 1] || '']"
				class="fas fa-caret-right"
				@click="handleYearSelected(years[index + 1] || '')"
			/>
		</small>
	</h2>
</template>
