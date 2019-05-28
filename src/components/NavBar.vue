<template>
	<nav
	 class="navbar navbar-expand-lg navbar-light fixed-top py-3"
	 id="mainNav"
	>
		<div class="container">
			<a
			 class="navbar-brand js-scroll-trigger"
			 href="#page-top"
			>Mintaváros</a>
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
						 class="nav-link js-scroll-trigger"
						 href="#inex"
						>Költségvetés</a>
					</li>
					<li class="nav-item">
						<a
						 class="nav-link js-scroll-trigger"
						 href="#milestones"
						>Fejlesztések</a>
					</li>
					<!--<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown"
						 aria-haspopup="true" aria-expanded="false">
							{{ year }}
						</a>
						<div class="dropdown-menu" aria-labelledby="navbarDropdown">
							<a class="dropdown-item" href="#">{{ year-1 }}</a>
							<a class="dropdown-item" href="#">{{ year-2 }}</a>
						</div>
					</li>-->
				</ul>
			</div>
		</div>
	</nav>
</template>

<style lang="scss">
@import '../scss/variables';
@import "~bootstrap/scss/functions";
@import '~bootstrap/scss/variables';
@import "~bootstrap/scss/mixins";

#mainNav {
	box-shadow: $box-shadow;
	background-color: $white;
	transition: background-color 0.2s ease;
	.navbar-brand {
		font-family: $font-family-sans-serif;
		font-weight: $font-weight-bold;
		color: $gray-900;
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
		background-color: transparent;
		.navbar-brand {
			color: fade-out($white, 0.3);
			&:hover {
				color: $white;
			}
		}
		.navbar-nav {
			.nav-item {
				.nav-link {
					color: fade-out($white, 0.3);
					padding: 0 1rem;
					&:hover {
						color: $white;
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
		&.navbar-scrolled {
			box-shadow: $box-shadow;
			background-color: $white;
			.navbar-brand {
				color: $gray-900;
				&:hover {
					color: $primary;
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
}
</style>
