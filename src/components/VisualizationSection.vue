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
	<section class="page-section">
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
			<div class="row justify-content-center">
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
				class="row justify-content-center mt-3"
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
