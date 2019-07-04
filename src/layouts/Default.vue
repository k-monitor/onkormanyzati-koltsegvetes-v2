<template>
	<div class="d-flex flex-column h-100">
		<NavBar
		 :year="year"
		 :years="$config.years"
		 @yearSelected="handleYearSelected"
		/>
		<MastHead href="#welcome" />
		<div class="flex-grow-1">
			<Welcome />
			<Inex :year="year" />
			<slot />
		</div>
		<Footer />
	</div>
</template>

<script>
import config from "~/data/config.js";

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
			}
		],
		bodyAttrs: {
			id: "page-top"
		},
		title: config.title
	},
	data() {
		return {
			year: 2018
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