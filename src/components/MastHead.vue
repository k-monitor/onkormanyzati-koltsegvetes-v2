<script setup lang="ts">
const { year } = useYear();

// Must not exceed the extra height of .masthead-bg (see styles below).
const PARALLAX_FACTOR = 0.3;

const masthead = ref<HTMLElement | null>(null);
const background = ref<HTMLElement | null>(null);

// Parallax: the background sits on its own layer and is moved with a transform.
// Animating background-position instead makes Firefox repaint the full-width
// cover image on every frame, which made scrolling stutter.
useScrollFrame(() => {
	const el = masthead.value;
	const bg = background.value;
	if (!el || !bg) return;
	const scrolled = Math.min(window.scrollY, el.offsetHeight);
	bg.style.transform = `translate3d(0, ${scrolled * PARALLAX_FACTOR}px, 0)`;
});
</script>

<template>
	<header
		id="masthead-parallax"
		ref="masthead"
		class="masthead d-flex align-items-center"
	>
		<div
			ref="background"
			class="masthead-bg"
		></div>
		<div class="container h-100">
			<div class="row h-100 align-items-center justify-content-center text-center">
				<div class="col-lg-10 align-self-end">
					<h1 class="text-white font-weight-bold">{{ CONFIG.header.title }}</h1>
					<hr class="divider my-4" />
				</div>
				<div class="col-lg-8 align-self-baseline">
					<p class="text-white font-weight-light mb-5">{{ CONFIG.header.headline }}</p>
					<div class="d-flex flex-wrap justify-content-center">
						<a
							class="btn btn-primary btn-xl js-scroll-trigger m-2"
							:href="`#${slugify(year)}/koszonto`"
							>{{ CONFIG.header.button }}</a
						>
						<NuxtLink
							class="btn btn-primary btn-xl m-2"
							to="/ev"
							>Éves áttekintés</NuxtLink
						>
					</div>
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
	position: relative;
	overflow: hidden;
	padding-top: 10rem;
	padding-bottom: calc(10rem - #{$navbar-height});
	// background & overlay defined in _theme.scss
	.masthead-bg {
		position: absolute;
		// extends above the header by the parallax travel (PARALLAX_FACTOR)
		top: -30%;
		left: 0;
		right: 0;
		bottom: 0;
		will-change: transform;
	}
	> .container {
		position: relative;
	}
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
