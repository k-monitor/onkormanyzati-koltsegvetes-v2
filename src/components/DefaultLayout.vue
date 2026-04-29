<script setup lang="ts">
const route = useRoute();

useHead({
	link: [
		{
			rel: 'canonical',
			href: new URL(route.fullPath, CONFIG.url).toString(),
		},
		{
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/introjs.min.css',
		},
		// FIXME intojs only needed for tutorial
	],
	meta: [
		{
			property: 'og:title',
			content: CONFIG.seo.ogTitle,
		},
		{
			property: 'og:url',
			content: new URL(route.fullPath, CONFIG.url).toString(),
		},
	],
	script: [
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.1/tinycolor.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/intro.min.js' },
		// FIXME intojs only needed for tutorial
	],
});

const { year } = useYear();
const { setNavigationScroll, sectionToElementId } = useScrollspy();

// Translate section slug to element ID
function translateSection(section: string): string {
	return sectionToElementId[section] || section;
}

// Extract section from hash (e.g., "#2024/koszonto" -> "koszonto")
function extractSectionFromHash(hash: string): string | null {
	const hashContent = hash.slice(1); // Remove #
	const match = hashContent.match(/^[\w-]+\/(.+)$/);
	if (match) {
		return match[1];
	}
	return null;
}

onMounted(() => {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	// Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
		if (
			location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
			location.hostname == this.hostname
		) {
			// Extract section from the new URL format (e.g., #2024/koszonto)
			const section = extractSectionFromHash(this.hash);
			const elementId = section ? translateSection(section) : null;
			let target = elementId ? $('#' + elementId) : $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				// Prevent scrollspy from updating URL during navigation scroll
				setNavigationScroll();
				scrollToElement(target, 72);
				return false;
			}
		}
	});

	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll-trigger').click(function () {
		$('.navbar-collapse').collapse('hide');
	});

	// Remove focus
	$('.js-scroll-trigger').click(function () {
		$(this).blur();
	});
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<NavBar />
		<SearchModal />
		<div class="flex-grow-1">
			<slot />
		</div>
		<Footer />
		<Social v-if="CONFIG.modules.social" />
		<FeedbackModal />
		<MoreInfoModal />
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/bootstrap';
@import '../scss/theme';

// Global styling for this template
body,
html {
	width: 100%;
	height: 100%;
}

// Typography
.text-white-75 {
	color: fade-out($white, 0.25);
}

h1,
h2 {
	text-transform: uppercase;
}

// Custom horizontal rules
hr.divider {
	max-width: 3.25rem;
	border-width: 0.2rem;
	border-color: $primary;
}

hr.light {
	border-color: $white;
}

// Button restyling
.btn {
	font-family: $font-family-sans-serif;
}

.btn-xl {
	padding: 1rem 2rem;
	font-size: 1rem;
	font-weight: 700;
	text-transform: uppercase;
}

// Page section padding
.page-section {
	padding: 8rem 0;
}

// Tooltips on mobile

@include media-breakpoint-down(sm) {
	.tooltip {
		bottom: 36px !important;
		display: flex;
		justify-content: center;
		left: 0;
		margin: auto;
		position: fixed !important;
		top: auto !important;
		transform: none !important;
		width: 100%;

		.arrow {
			display: none;
		}

		.tooltip-inner {
			max-width: none;
		}
	}
}
</style>
