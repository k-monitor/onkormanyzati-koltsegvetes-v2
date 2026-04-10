<script setup lang="ts">
defineProps<{
	side: 'income' | 'expense';
	text: string;
	title: string;
	height?: number;
}>();

const { year } = useYear();
</script>

<template>
	<section class="page-section" :class="{ 'embed-mode': height }" :style="height ? { '--embed-height': height + 'px' } : undefined">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<SectionHeading
						:title="title"
						:year="year"
					/>
					<hr class="divider my-4 mb-5" />
				</div>
			</div>
			<div class="row justify-content-center vis-row">
				<div class="col-lg-8 text-center">
					<Visualization
						:defaultMode="side == 'expense' ? 1 : 0"
						:id="side + '-vis'"
						:year="year"
						:side="side"
						:height="height"
					/>
				</div>
				<p class="d-md-none font-italic p-3 small text-center text-muted">
					Érintőképernyős eszközökön a kategória leírások megjelenítéséhez tartsa az ujját
					a hasábon egy kis ideig.
				</p>
			</div>
			<div
				class="row justify-content-center mt-5"
				v-if="text && !height"
			>
				<div class="col-lg-8 text-center">
					<VueMarkdown
						:source="text"
						:anchorAttributes="{ target: '_blank' }"
					/>
				</div>
			</div>
			<div
				class="row justify-content-center mt-3 source-row"
				v-if="height"
			>
				<div class="col-lg-8 text-center">
					<a :href="CONFIG.url" target="_blank" class="source-link">
						<i class="fas fa-external-link-alt mr-1"></i>
						{{ CONFIG.seo.siteName }} - {{ CONFIG.seo.pageTitle }}
					</a>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
.embed-mode {
	height: var(--embed-height);
	padding: 1rem 0 !important;
	box-sizing: border-box;

	:deep(.container) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	:deep(.vis-row) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;

		> .col-lg-8 {
			flex: 1;
			min-height: 0;
			display: flex;
			flex-direction: column;
		}
	}

	:deep(.source-row) {
		flex-shrink: 0;
	}

	:deep(.visualization) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;

		.vis {
			flex: 1;
			min-height: 0;
			height: auto !important;
		}
	}
}
</style>
