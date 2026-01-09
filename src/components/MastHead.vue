<script setup lang="ts">
const { year } = useYear();

onMounted(() => {
	window.addEventListener('scroll', function () {
		const scrollPosition = window.pageYOffset;
		const bgParallax = document.getElementById('masthead-parallax');
		if (bgParallax) bgParallax.style.backgroundPositionY = 100 - scrollPosition * 0.15 + '%';
	});
});
</script>

<template>
	<header
		class="masthead d-flex align-items-center"
		id="masthead-parallax"
	>
		<div class="container h-100 pt-5">
			<div class="row h-100 align-items-center justify-content-center text-center">
				<div class="col-lg-10 align-self-end">
					<h1 class="text-white font-weight-bold">{{ CONFIG.header.title }}</h1>
					<hr class="divider my-4" />
				</div>
				<div class="col-lg-8 align-self-baseline">
					<p class="text-white font-weight-light mb-5">{{ CONFIG.header.headline }}</p>
					<a
						class="btn btn-primary btn-xl js-scroll-trigger"
						:href="`#${year}-koszonto`"
						>{{ CONFIG.header.button }}</a
					>
				</div>
			</div>
		</div>
	</header>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

header.masthead {
	padding-top: 10rem;
	padding-bottom: calc(10rem - #{$navbar-height});
	// background & overlay defined in _theme.scss
	h1 {
		font-size: 2.25rem;
	}
	@include media-breakpoint-up(lg) {
		//height: 100vh;
		min-height: 40rem;
		padding-top: $navbar-height;
		padding-bottom: 0;
		p {
			font-size: 1.15rem;
		}
		h1 {
			font-size: 3rem;
		}
	}
	@include media-breakpoint-up(xl) {
		h1 {
			font-size: 3.5rem;
		}
	}
	.btn-xl {
		border: none;
	}
}
</style>
