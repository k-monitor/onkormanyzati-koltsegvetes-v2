<script setup lang="ts">
const { title, year } = defineProps<{ title: string; year: string }>();

const years = computed(() => Object.keys(DATA).sort());
const index = computed(() => years.value.indexOf(year));

const previousYear = computed(() => years.value[index.value - 1] || '');
const nextYear = computed(() => years.value[index.value + 1] || '');

const { handleYearSelected } = useYear();
</script>

<template>
	<h2>{{ title }}</h2>
	<div class="d-flex align-items-center justify-content-center text-muted">
		<span
			v-if="previousYear"
			class="neighbor-year"
			@click="handleYearSelected(previousYear)"
		>
			<span class="d-none d-sm-inline">{{ previousYear }}</span>
			<i
				class="fas fa-caret-left"
				@click="handleYearSelected(previousYear)"
			/>
		</span>
		<span class="current-year">{{ year }}</span>
		<span
			v-if="nextYear"
			class="neighbor-year"
			@click="handleYearSelected(nextYear)"
		>
			<i
				class="fas fa-caret-right"
				@click="handleYearSelected(nextYear)"
			/>
			<span class="d-none d-sm-inline">{{ nextYear }}</span>
		</span>
	</div>
</template>

<style scoped>
.current-year {
	font-size: 1.5rem;
	font-weight: bold;
	margin: 0 0.5rem;
}
.neighbor-year {
	cursor: pointer;
	font-size: 1.25rem;
}
i {
	margin: 0 0.5rem;
}
</style>
