<template>
	<section class="page-section">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<h2>
						{{ title }}
						<small class="ml-1 text-muted">{{ year }}</small>
					</h2>
					<hr class="divider my-4 mb-5">
				</div>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<Visualization
						:defaultMode="side == 'expense' ? 1 : 0"
						:id="side + '-vis'"
						:year="year"
						:side="side"
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	props: ["year", "side", "title"]
};
</script>

