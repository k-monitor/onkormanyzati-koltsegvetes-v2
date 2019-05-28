<template>
	<div class="d-flex flex-column h-100">
		<NavBar />
		<MastHead />
		<div class="flex-grow-1">
			<slot />
		</div>
		<Footer />
	</div>
</template>

<script>
import config from "~/data/config.json";
import $ from "jquery";
import "popper.js";
import "bootstrap";

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
		script: [
			/*{
				src:
					"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
				body: true
			},
			{
				src:
					"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.bundle.min.js",
				body: true
			},*/
			/*{
				src:
					"https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js",
				body: true
			},
			{
				src:
					"https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.6.3/papaparse.min.js",
				body: true
			},
			{
				src:
					"https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.1/tinycolor.min.js",
				body: true
			}*/
		],
		bodyAttrs: {
			id: "page-top"
		},
		title: config.title
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
	border: none;
	border-radius: 10rem;
}

// Page section padding
.page-section {
	padding: 8rem 0;
}
</style>