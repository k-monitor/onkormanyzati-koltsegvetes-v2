<script setup lang="ts">
defineProps<{
	side: 'expense' | 'income';
	title: string;
	text?: string;
}>();

const years = computed(() => Object.keys(DATA).sort());
const yearsRange = computed(() => {
	if (years.value.length === 0) return '';
	if (years.value.length === 1) return years.value[0];
	return `${years.value[0]} - ${years.value[years.value.length - 1]}`;
});
</script>

<template>
	<section class="page-section">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-10 text-center">
					<h2>
						{{ title }}
						<small class="ml-3 text-muted">{{ yearsRange }}</small>
					</h2>
					<hr class="divider my-4 mb-5" />
				</div>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-10">
					<FunctionTimeSeries :side="side" />
				</div>
			</div>
			<div
				class="row justify-content-center mt-5"
				v-if="text"
			>
				<div class="col-lg-8 text-center">
					<VueMarkdown
						:source="text"
						:anchorAttributes="{ target: '_blank' }"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
