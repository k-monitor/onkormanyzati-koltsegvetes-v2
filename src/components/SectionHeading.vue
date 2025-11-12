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
				class="fas fa-caret-left"
				v-if="DATA[years[index - 1] || '']"
				@click="handleYearSelected(years[index - 1] || '')"
			></i>
			{{ year }}
			<i
				class="fas fa-caret-right"
				v-if="DATA[years[index + 1] || '']"
				@click="handleYearSelected(years[index + 1] || '')"
			></i>
		</small>
	</h2>
</template>
