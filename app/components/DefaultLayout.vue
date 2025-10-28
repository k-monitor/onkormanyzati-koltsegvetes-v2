<script setup lang="ts">
const { canShowMilestones, handleYearSelected, year } = useYear();
// TODO LATER these can be used directly inside components, no need for prop drilling

useHead({
	bodyAttrs: {
		id: 'page-top',
	},
	htmlAttrs: {
		lang: 'hu',
	},
	link: [
		{
			rel: 'canonical',
			href: CONFIG.url,
		},
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=latin-ext',
		},
		{
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css',
		},
		{
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/introjs.min.css',
		},
	],
	meta: [
		{
			property: 'og:site_name',
			content: CONFIG.seo.siteName,
		},
		{
			property: 'og:title',
			content: CONFIG.seo.ogTitle,
		},
		{
			name: 'description',
			property: 'og:description',
			content: CONFIG.seo.description,
		},
		{
			property: 'og:url',
			content: CONFIG.url,
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'og:image',
			content: CONFIG.url + 'assets/img/ogimage.jpg',
		},
	],
	script: [
		{ src: 'https://cdn.jsdelivr.net/npm/jquery@3.6.1/dist/jquery.min.js' },
		{ src: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.1/tinycolor.min.js' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/intro.min.js' },
	],
	title: CONFIG.seo.pageTitle,
});

onMounted(() => {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	// Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
		if (
			location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
			location.hostname == this.hostname
		) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
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
		<NavBar
			:years="Object.keys(DATA).sort().reverse()"
			@yearSelected="handleYearSelected"
		/>
		<SearchModal :year="year" />
		<MastHead href="#welcome" />
		<div class="flex-grow-1">
			<Welcome
				:year="year"
				id="welcome"
			/>
			<PublicationSection v-if="CONFIG.modules.pub" />
			<Inex
				v-if="CONFIG.modules.inex"
				:year="year"
				id="inex"
			/>
			<VisualizationSection
				v-if="CONFIG.modules.income"
				:year="year"
				id="income"
				side="income"
				:text="CONFIG.vis.incomeText"
				:title="CONFIG.vis.income"
			/>
			<VisualizationSection
				:year="year"
				class="bg-light"
				id="expense"
				side="expense"
				:text="CONFIG.vis.expenseText"
				:title="CONFIG.vis.expense"
			/>
			<MilestoneSection
				v-if="canShowMilestones"
				:year="year"
				class="pb-0"
				id="milestones"
			/>
			<FeedbackSection v-if="CONFIG.modules.feedback" />
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
	padding: 1.25rem 2.25rem;
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	border-radius: 10rem;
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
