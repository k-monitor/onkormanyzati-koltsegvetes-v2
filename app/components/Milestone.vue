<script setup lang="ts">
defineProps<{
	milestone: MilestoneWithId;
	nextId: string;
	prevId: string;
}>();

function modalId(milestoneId: string) {
	return 'milestone-modal-' + milestoneId;
}
</script>

<template>
	<div>
		<div
			class="milestone d-flex flex-column align-items-end w-100"
			data-toggle="modal"
			:data-target="'#' + modalId(milestone.id)"
		>
			<div class="embed-responsive embed-responsive-16by9">
				<div
					class="embed-responsive-item milestone-picture"
					:class="{ overlay: milestone.overlay }"
					:style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
				></div>
			</div>
			<h5 class="bg-white milestone-title px-2 text-center w-100">{{ milestone.title }}</h5>
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

<style lang="scss">
@import '../scss/variables';
@import '../scss/common';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

.milestone-picture,
.milestone-modal-picture {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;

	&.overlay::after {
		content: '';
		display: block;
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		width: 100%;
	}
}

.milestone {
	cursor: pointer;
	transition: all 0.2s ease;

	.milestone-picture {
		filter: brightness(0.8);
		transition: all 0.2s ease;
		z-index: -1;
	}

	.milestone-title {
		margin: 0;
		padding: 0.5rem 0 1rem;
		transition: all 0.2s ease;
	}

	&:hover {
		.milestone-picture {
			filter: none;
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
