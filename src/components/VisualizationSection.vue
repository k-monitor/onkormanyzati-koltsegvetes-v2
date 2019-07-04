<template>
	<section class="page-section">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<h2>{{ title }}</h2>
					<hr class="divider my-4 mb-5">
				</div>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<Visualization
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

