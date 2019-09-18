<template>
	<div
	 class="milestone d-flex align-items-end"
	 data-toggle="modal"
	 :data-target="'#' + modalId"
	>
		<div
		 class="milestone-picture"
		 :style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
		></div>
		<h5 class="milestone-title text-center text-white w-100">{{ milestone.title }}</h5>
		<div
		 class="modal fade"
		 :id="modalId"
		 tabindex="-1"
		 role="dialog"
		>
			<div
			 class="modal-dialog modal-dialog-centered modal-lg"
			 role="document"
			>
				<div class="modal-content bg-dark">
					<div class="modal-body p-0">
						<div class="embed-responsive embed-responsive-16by9">
							<div
							 class="embed-responsive-item milestone-modal-picture"
							 :style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
							></div>
						</div>
						<div class="m-3">
							<p class="lead text-white">{{ milestone.title }}</p>
							<p class="m-0 text-justify text-white-75">{{ milestone.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ["milestone"],
	computed: {
		modalId() {
			return "milestone-modal-" + this.milestone.id;
		}
	}
};
</script>

<style lang="scss">
.milestone {
	cursor: pointer;
	transition: all 0.2s ease;

	.milestone-picture,
	.milestone-modal-picture {
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}

	.milestone-picture {
		filter: brightness(0.8);
		height: 100%;
		position: absolute;
		top: 0;
		transition: all 0.2s ease;
		width: 100%;
		z-index: -1;
	}

	.milestone-title {
		// https://cssgradient.io/
		$shadow: black;
		background: $shadow;
		background: -moz-linear-gradient(0deg, $shadow 0%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			$shadow 0%,
			rgba(0, 0, 0, 0) 100%
		);
		background: linear-gradient(0deg, $shadow 0%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);

		margin: 0;
		padding: 0.5rem 0;
		text-shadow: 0px 0px 5px black;
		transition: all 0.2s ease;
	}

	&:hover {
		.milestone-picture {
			filter: none;
		}

		.milestone-title {
			padding-bottom: 1rem;
		}
	}
}
</style>

