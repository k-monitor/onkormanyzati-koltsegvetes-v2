<template>
	<nav
		class="navbar navbar-expand-lg navbar-light fixed-top py-3"
		id="mainNav"
	>
		<div class="container">
			<a
				class="navbar-brand js-scroll-trigger"
				href="#page-top"
			>
				<img class="mr-2" src="assets/img/logo.png" width="135" height="75" alt="">
				{{ $config.city }}
			</a>
			<button
				class="navbar-toggler navbar-toggler-right"
				type="button"
				data-toggle="collapse"
				data-target="#navbarResponsive"
				aria-controls="navbarResponsive"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div
				class="collapse navbar-collapse"
				id="navbarResponsive"
			>
				<ul class="navbar-nav ml-auto my-2 my-lg-0">
					<li class="nav-item">
						<a
							href="javascript:void(0)"
							class="nav-link"
							data-toggle="modal"
							data-target="#search-modal"
						>
							<i class="fas fa-search"></i>
						</a>
					</li>
					<li class="nav-item">
						<a
							href="#welcome"
							class="nav-link js-scroll-trigger"
						>{{ $config.navBar.welcome }}</a>
					</li>
					<li class="nav-item">
						<a
							:href="'#' + ($config.modules.inex ? 'inex' : ($config.modules.income ? 'income' : 'expense'))"
							class="nav-link js-scroll-trigger"
						>{{ $config.navBar.inex }}</a>
					</li>
					<li
						class="nav-item"
						v-if="$config.modules.milestones"
					>
						<a
							href="#milestones"
							class="nav-link js-scroll-trigger"
						>{{ $config.navBar.milestones }}</a>
					</li>
					<li
						class="nav-item dropdown highlight"
						v-if="years.length > 1"
					>
						<a
							class="nav-link dropdown-toggle"
							href="#"
							id="navbarDropdown"
							role="button"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
						>
							<span class="mr-1">{{ year }}</span>
						</a>
						<div
							class="dropdown-menu dropdown-menu-right"
							aria-labelledby="navbarDropdown"
						>
							<a
								class="dropdown-item"
								href="javascript:void(0)"
								v-for="y in years"
								:class="['theme-' + Object.keys($d).sort().indexOf(y)]"
								:key="y"
								@click="$emit('yearSelected', y)"
							>
								<i class="fas fa-circle mr-2"></i>
								{{ y }}
							</a>
						</div>
					</li>
					<li class="nav-item">
						<a
							href="javascript:void(0)"
							class="nav-link"
							data-toggle="modal"
							data-target="#moreInfoModal"
						>{{ $config.navBar.moreInfo }}</a>
					</li>
					<li class="nav-item">
						<a
							class="nav-link"
							data-target="#feedbackModal"
							data-toggle="modal"
							href="javascript:void(0)"
						>
							<i class="far fa-comment-dots"></i>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script>
export default {
	props: ["year", "years"],
	mounted() {
		// Activate scrollspy to add active class to navbar items on scroll
		$("body").scrollspy({
			target: "#mainNav",
			offset: 75
		});

		// Collapse Navbar
		var navbarCollapse = function() {
			if ($("#mainNav").offset().top > 100) {
				$("#mainNav").addClass("navbar-scrolled");
			} else {
				$("#mainNav").removeClass("navbar-scrolled");
			}
		};
		// Collapse now if page is not at top
		navbarCollapse();
		// Collapse the navbar when page is scrolled
		$(window).scroll(navbarCollapse);
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

@mixin shrinkedLogo() {
	height: 30px;
	width: 54px;
}

#mainNav {
	box-shadow: $box-shadow;
	background-color: $white;
	transition: background-color 0.2s ease;
	.navbar-brand {
		font-family: $font-family-sans-serif;
		font-weight: $font-weight-bold;
		color: $gray-900;
		img {
			position: relative;
			transition: all .2s;
			top: -2px;
		}
	}
	.navbar-nav {
		.nav-item {
			.nav-link {
				color: $gray-900;
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
		.navbar-nav {
			.nav-item {
				.nav-link {
					padding: 0 1rem;
				}
				&:last-child {
					.nav-link {
						padding-right: 0;
					}
				}
			}
		}
		// Navbar styling applied when the page is scrolled
		&.navbar-scrolled {
			.navbar-brand {
				&:hover {
					color: $primary;
				}
				img {
					@include shrinkedLogo();
				}
			}
		}
	}

	// highlight

	.nav-item:last-child .nav-link {
		margin-right: 1rem;
	}

	@include media-breakpoint-up(lg) {
		.navbar-nav .nav-item.highlight {
			.nav-link {
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
					color: white !important;
					text-decoration: none;
				}

				&:hover {
					background-color: darken($primary, 10%);
				}
			}
		}
	}
}
</style>
