<template>
	<div>
		<NavBar
		 :year="year"
		 :years="Object.keys($d).sort().reverse()"
		 @yearSelected="handleYearSelected"
		/>
		<SearchModal />
		<MastHead href="#welcome" />
		<div class="flex-grow-1">
			<Welcome id="welcome" />
			<Inex
			 :year="year"
			 id="inex"
			 v-if="$config.modules.inex"
			/>
			<VisualizationSection
			 :year="year"
			 id="income"
			 side="income"
			 title="Bevételek"
			 v-if="$config.modules.income"
			/>
			<VisualizationSection
			 :year="year"
			 class="bg-light"
			 id="expense"
			 side="expense"
			 title="Kiadások"
			/>
			<MilestoneSection
			 class="pb-0"
			 id="milestones"
			 v-if="$config.modules.milestones"
			/>
			<slot />
		</div>
		<Footer />
		<Social />
	</div>
</template>

<script>
import config from "~/data/config.js"; // import is needed because metaInfo below cannot access $config

export default {
	metaInfo: {
		htmlAttrs: {
			lang: "hu"
		},
		link: [
			{
				rel: "stylesheet",
				href:
					"https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=latin-ext"
			},
			{
				rel: "stylesheet",
				href:
					"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.1/css/all.min.css"
			},
			{
				rel: "canonical",
				href: config.url
			}
		],
		title: config.seo.pageTitle,
		meta: [
			{
				property: "og:site_name",
				content: config.seo.siteName
			},
			{
				property: "og:title",
				content: config.seo.pageTitle
			},
			{
				name: "description",
				property: "og:description",
				content: config.seo.description
			},
			{
				property: "og:url",
				content: config.url
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:image",
				content: config.seo.ogImage
			},
			{
				property: "og:image:type",
				content: config.seo.ogImageType
			},
			{
				property: "og:image:height",
				content: config.seo.ogImageHeight
			},
			{
				property: "og:image:width",
				content: config.seo.ogImageWidth
			}
		],
		bodyAttrs: {
			id: "page-top"
		}
	},
	data() {
		return {
			year: config.defaultYear
		};
	},
	methods: {
		handleYearSelected(year) {
			this.year = year;
		}
	},
	mounted() {
		// Smooth scrolling using jQuery easing
		$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
			if (
				location.pathname.replace(/^\//, "") ==
					this.pathname.replace(/^\//, "") &&
				location.hostname == this.hostname
			) {
				var target = $(this.hash);
				target = target.length
					? target
					: $("[name=" + this.hash.slice(1) + "]");
				if (target.length) {
					$("html, body").animate(
						{
							scrollTop: target.offset().top - 72
						},
						1000,
						"easeInOutExpo"
					);
					return false;
				}
			}
		});

		// Closes responsive menu when a scroll trigger link is clicked
		$(".js-scroll-trigger").click(function() {
			$(".navbar-collapse").collapse("hide");
		});

		// Remove focus
		$(".js-scroll-trigger").click(function() {
			$(this).blur();
		});
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/bootstrap";

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
</style>
