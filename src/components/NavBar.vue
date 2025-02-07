<template>
	<div id="outerDiv">
		<nav class="navbar navbar-expand-lg navbar-light fixed-top py-3" id="mainNav">
			<div class="container">
				<a class="navbar-brand js-scroll-trigger" href="#page-top">
					<img class="mr-2" src="/assets/img/logo.png" width="30" height="30" alt="">
					{{ $config.city }}
				</a>
				<button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
					data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false"
					aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarResponsive">
					<ul v-if="!subpageMode" class="navbar-nav ml-auto my-2 my-lg-0 align-items-center">
						<li class="nav-item">
							<a href="javascript:void(0)" class="nav-link px-2 py-1 rounded-pill search-nav-link"
								data-toggle="modal" data-target="#search-modal">
								<i class="fas fa-search"></i>
								<span class="sr-only">Keresés</span>
							</a>
						</li>
						<li class="nav-item">
							<a href="#welcome" class="nav-link js-scroll-trigger">{{ $config.navBar.welcome }}</a>
						</li>
						<li class="nav-item">
							<a :href="'#' + ($config.modules.inex ? 'inex' : ($config.modules.income ? 'income' : 'expense'))"
								class="nav-link js-scroll-trigger">{{ $config.navBar.inex }}</a>
						</li>
						<li class="nav-item"
							v-if="$config.modules.milestones && Object.entries($milestones.milestones).filter(m => m[1].year == year).length > 0">
							<a href="#milestones" class="nav-link js-scroll-trigger">{{ $config.navBar.milestones }}</a>
						</li>
						<li class="nav-item dropdown highlight" v-if="years.length > 1">
							<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
								data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<span class="mr-1">{{ year }}</span>
							</a>
							<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
								<a class="dropdown-item" href="javascript:void(0)" v-for="y in years"
									:class="['theme-' + $util.slugify(y)]" :key="y" @click="$emit('yearSelected', y)">
									<i class="fas fa-circle mr-2"></i>
									{{ y }}
								</a>
							</div>
						</li>
						<li class="nav-item">
							<a href="javascript:void(0)" class="nav-link" data-toggle="modal"
								data-target="#moreInfoModal">{{ $config.navBar.moreInfo }}</a>
						</li>
						<li v-if="$config.iframe.title && $config.iframe.url" class="nav-item">
							<a :href="`/${$util.slugify($config.iframe.title).toLowerCase()}`" class="nav-link">{{
								$config.iframe.title }}</a>
						</li>
						<li v-if="$config.modules.feedback" class="nav-item">
							<a class="nav-link" data-target="#feedbackModal" data-toggle="modal"
								href="javascript:void(0)">
								<i class="far fa-comment-dots"></i>
							</a>
						</li>
					</ul>
					<ul class="navbar-nav ml-auto my-2 my-lg-0" v-else>
						<li class="nav-item">
							<a class="nav-link" href="/">
								Vissza a költségetésre
							</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
		<div id="banner" v-if="isBannerVisible && $config.navBar.showBanner">
			<VueMarkdown :source="$config.navBar.bannerText" :class="{ less: less, more: !less }" />
			<button aria-label="Close" class="close-banner" @click="closeBanner" type="button">
				<span aria-hidden="true">
					<i class="far fa-times-circle"></i>
				</span>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	props: ["subpageMode", "year", "years"],
	data() {
        return {
            isBannerVisible: true
        };
    },
	mounted() {
		// Activate scrollspy to add active class to navbar items on scroll
		$("body").scrollspy({
			target: "#mainNav",
			offset: 75,
		});

		// Collapse Navbar
		var navbarCollapse = function () {
			if ($("#mainNav").offset().top > 100) {
				$("#mainNav").addClass("navbar-scrolled");
			} else {
				$("#mainNav").removeClass("navbar-scrolled");
			}
			// Set banner position
			$("#banner").css("top", $("#mainNav").height() + 30 + "px");
		};
		// Collapse now if page is not at top
		navbarCollapse();

		// Fix banner position after nav bar transition
		$("#mainNav").on("transitionend", function () {
			$("#banner").css("top", $("#mainNav").height() + 30 + "px");
		});

		// Collapse the navbar when page is scrolled
		$(window).scroll(navbarCollapse);
	},
    methods: {
        closeBanner() {
            this.isBannerVisible = false;
        }
    }
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

@mixin enlargedLogo() {
	height: 48px;
	width: 48px;
}

#banner {
	box-shadow: $box-shadow;
	position: fixed;
	top: 90px;
	z-index: 1000;
	background-color: $primary;
	width: 100%;
	color: $white;
	padding: 8px;
	p {
		margin: 0;
	}
	a {
		color: $white;
		text-decoration: underline;
	}
	.close-banner {
		right: 10px;
		position: absolute;
		top: 8px;
		background: none;
		border: none;
		i {
			color: $white;
			font-size: 1.5rem;
		}
	}
}

#mainNav {
	box-shadow: $box-shadow;
	background-color: $white;
	transition: background-color 0.2s ease;
	.navbar-brand {
		font-family: $font-family-sans-serif;
		font-weight: $font-weight-bold;
		img {
			// filter: invert(1);
			position: relative;
			transition: all 0.2s;
			top: -2px;
		}
	}
	.navbar-nav {
		.nav-item {
			.nav-link {
				color: $gray-600;
				font-family: $font-family-sans-serif;
				font-weight: $font-weight-bold;
				font-size: 0.9rem;
				padding: 0.75rem 0;
				&:hover,
				&:active {
					color: $primary;
				}
				&.active {
					color: $primary !important;
				}
			}
		}
	}
	@include media-breakpoint-up(lg) {
		// Base styling for the navbar - screen sizes greater than the large breakpoint
		box-shadow: none;
		// background-color: transparent;
		.navbar-brand {
			img {
				filter: none;
			}
		}
		.navbar-nav {
			.nav-item {
				.nav-link {
					color: $gray-900; // fade-out($white, 0.3);
					padding: 0 1rem;
					&:hover {
						color: $primary; // $white;
					}
				}
				&:last-child {
					.nav-link {
						padding-right: 0;
					}
				}
			}
		}
		// Navbar styling applied when the page is scrolled
		&:not(.navbar-scrolled) .navbar-brand img {
			@include enlargedLogo();
		}
		&.navbar-scrolled {
			box-shadow: $box-shadow;
			background-color: $white;
			.navbar-brand {
				img {
					// filter: invert(1);
				}
			}
			.navbar-nav {
				.nav-item {
					.nav-link {
						color: $gray-900;
						&:hover {
							color: $primary;
						}
					}
				}
			}
		}
	}

	// highlight

	/*&, & > div.container-fluid {
		padding-right: 0;
	}*/
	.nav-item:last-child .nav-link {
		margin-right: 1rem;
	}

	@include media-breakpoint-up(lg) {
		.navbar-nav .nav-item.highlight {
			.nav-link {
				color: $gray-900 !important; // white !important;
				text-decoration: underline;
			}
		}
		&.navbar-scrolled {
			.navbar-nav .nav-item.highlight {
				$d: 1.6rem;
				background-color: $primary;
				margin-bottom: -$d;
				margin-top: -$d;
				padding: $d 0;
				min-height: 100%;
				position: relative;

				.nav-link {
					color: $white !important;
					text-decoration: none;
				}

				&:hover {
					background-color: darken($primary, 10%);
				}
			}
		}
	}
}

.search-nav-link {
	background-color: $gray-200;
	width: 100px;
	&:hover {
		background-color: $gray-300;
	}
}
</style>
