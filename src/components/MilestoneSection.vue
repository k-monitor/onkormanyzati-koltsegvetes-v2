<template>
	<section class="page-section milestones bg-primary text-white">
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="col text-center">
					<h2>Fejlesztések</h2>
					<hr class="divider light my-4 mb-5">
				</div>
			</div>
			<div class="row">
				<div
				 class="col-md-6 col-lg-4 p-3 milestone-col"
				 v-for="(m, i) in $milestones"
				 :key="i"
				>
					<Milestone :milestone="m" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.milestones .card-columns {
	column-count: 1;

	@include media-breakpoint-up(sm) {
		column-count: 2;
	}
	@include media-breakpoint-up(lg) {
		column-count: 3;
	}
	/*@include media-breakpoint-up(xl) {
		column-count: 4;
	}*/
}

.milestones .milestone-col {
	background-color: $primary;
	$ac: darken($primary, 10%);
	color: white;
	@include media-breakpoint-only(md) {
		&:nth-child(4n-2),
		&:nth-child(4n-1) {
			background-color: $ac;
			//color: white;
		}
	}
	@include media-breakpoint-up(lg) {
		&:nth-child(even) {
			background-color: $ac;
			//color: white;
		}
	}

	.card {
		background-color: rgba(255, 255, 255, 0.1);
		border: none;
		height: 100%;
	}
}
</style>

