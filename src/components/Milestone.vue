<template>
	<div class="d-flex">
		<div
			class="milestone d-flex align-items-end w-100"
			data-toggle="modal"
			:data-target="'#' + modalId(milestone.id)"
		>
			<div
				class="milestone-picture"
				:style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
			></div>
			<h5 class="milestone-title text-center text-white w-100">{{ milestone.title }}</h5>
		</div>
		<div
			class="modal fade"
			:id="modalId(milestone.id)"
			tabindex="-1"
			role="dialog"
		>
			<MilestoneModalContent
				:milestone="milestone"
				:modalId="modalId(milestone.id)"
				:nextModalId="modalId(nextId)"
				:prevModalId="modalId(prevId)"
			/>
		</div>
	</div>
</template>

<script>
export default {
	props: ["milestone", "nextId", "prevId"],
	data() {
		return {
			playing: false
		};
	},
	methods: {
		modalId(milestoneId) {
			return "milestone-modal-" + milestoneId;
		}
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "../scss/common";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.milestone-picture,
.milestone-modal-picture {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.milestone {
	cursor: pointer;
	transition: all 0.2s ease;

	.milestone-picture {
		filter: brightness(0.8);
		height: 100%;
		position: absolute;
		top: 0;
		transition: all 0.2s ease;
		width: 100%;
		z-index: -1;

		&::after {
			content: "";
			display: block;
			height: 100%;
			left: 0;
			position: absolute;
			top: 0;
			width: 100%;
		}
	}

	.milestone-title {
		// https://cssgradient.io/
		$shadow: fade-out(black, 0.6);
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

.milestone-modal-picture i {
	cursor: pointer;
	text-shadow: 0px 0px 5px black;
}

.milestone-modal-picture {
	.next,
	.prev,
	.play {
		i {
			font-size: 2.5rem;
			@include media-breakpoint-up(sm) {
				font-size: 3rem;
			}
			@include media-breakpoint-up(md) {
				font-size: 3.5rem;
			}
			@include media-breakpoint-up(lg) {
				font-size: 4rem;
			}
		}
	}

	.z1 {
		z-index: 1;
	}
}
</style>

