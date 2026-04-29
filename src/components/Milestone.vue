<script setup lang="ts">
import search from '../utils/search';

const props = defineProps<{
	milestone: MilestoneWithId;
	nextId: string;
	prevId: string;
	mapModal?: boolean;
}>();

function modalId(milestoneId: string, mapModal: boolean = false): string {
	return 'milestone-modal-' + (mapModal ? 'map-' : '') + milestoneId;
}

const budgetTotal = computed(() => {
	let sum = 0;
	(props.milestone.nodeIds || []).forEach((id) => {
		const hit = search(String(props.milestone.year), id, []).find((r) => r.matchedId);
		if (hit) sum += hit.value || 0;
	});
	return sum;
});
</script>

<template>
	<div
		v-if="!mapModal"
		class="milestone d-flex flex-column align-items-end w-100"
		data-toggle="modal"
		:data-target="'#' + modalId(milestone.id, mapModal)"
	>
		<div class="embed-responsive embed-responsive-16by9">
			<div
				class="embed-responsive-item milestone-picture"
				:class="{ overlay: milestone.overlay }"
				:style="{
					backgroundImage: 'url(../' + milestone.picture + ')',
				}"
			/>
			<span
				v-if="budgetTotal"
				class="milestone-amount bg-primary text-white font-weight-bold px-2 py-1"
				>{{ groupNums(budgetTotal, true, ['', 'ezer', 'millió', 'milliárd']) }}</span
			>
		</div>
		<h5 class="bg-white milestone-title px-2 text-center w-100">
			{{ milestone.title }}
		</h5>
	</div>
	<div
		:id="modalId(milestone.id, mapModal)"
		class="modal fade"
		role="dialog"
		tabindex="-1"
	>
		<MilestoneModalContent
			:milestone="milestone"
			:modal-id="modalId(milestone.id, mapModal)"
			:next-modal-id="modalId(nextId, mapModal)"
			:prev-modal-id="modalId(prevId, mapModal)"
			:map-modal="mapModal"
		/>
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

	.milestone-amount {
		position: absolute;
		bottom: 0;
		left: 0;
		font-size: 1.1rem;
		filter: brightness(0.8);
		transition: all 0.2s ease;
	}

	&:hover {
		.milestone-picture,
		.milestone-amount {
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
