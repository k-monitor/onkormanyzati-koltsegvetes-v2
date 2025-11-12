<script setup lang="ts">
import search from '../utils/search';

const { milestone, modalId, nextModalId, prevModalId } = defineProps<{
	milestone: MilestoneWithId;
	modalId: string;
	nextModalId: string;
	prevModalId: string;
}>();

const playing = ref(false);

const nodes = computed(() => {
	// TODO LATER search result type
	const nodes = [];
	milestone.nodeIds.forEach((id) => {
		const results = search(milestone.year, id).filter((r) => r.matchedId);
		if (results.length) nodes.push(results[0]);
	});
	return nodes;
});

function play() {
	playing.value = true;
}

function switchModal(id: string) {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	$('.modal').modal('hide');
	setTimeout(() => $('#' + id).modal('show'), 325);
}

function prev() {
	switchModal(prevModalId);
}

function next() {
	switchModal(nextModalId);
}

function jump(result) {
	// TODO LATER search result type
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	// based on SearchModalContent.vue#jump
	$('.modal').modal('hide');
	if ($('#mainNav .show').length > 0) $('#mainNav button').click();

	scrollToElement($('#' + result.side), 72);
	setTimeout(function () {
		eventBus.emit('jump', result);
	}, 1000);
}

onMounted(() => {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;
	$('#' + modalId).on('hide.bs.modal', () => {
		playing.value = false;
	});
});
</script>

<template>
	<div
		class="modal-dialog modal-dialog-centered modal-lg"
		role="document"
	>
		<div class="modal-content bg-dark">
			<div class="modal-body p-0">
				<div class="embed-responsive embed-responsive-16by9">
					<div
						class="embed-responsive-item milestone-modal-picture d-flex flex-column text-white"
						:style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
					>
						<div
							class="h-100 position-absolute w-100"
							v-if="milestone.vid && playing"
						>
							<video
								:src="milestone.vid"
								autoplay
								class="h-100 w-100"
								loop
							></video>
						</div>
						<div class="text-right w-100 small z1">
							<i
								class="far fa-times-circle fa-2x m-2"
								data-dismiss="modal"
							></i>
						</div>
						<div class="d-flex flex-grow-1 w-100 z1">
							<div
								class="pl-3 w-25 d-flex flex-column justify-content-center prev"
								@click="prev()"
							>
								<div>
									<i class="fas fa-angle-left"></i>
								</div>
							</div>
							<div class="d-flex flex-grow-1 play">
								<i
									@click="play()"
									class="fas fa-play m-auto"
									v-if="milestone.vid && !playing"
								></i>
							</div>
							<div
								class="ml-auto pr-3 w-25 d-flex flex-column justify-content-center next"
								@click="next()"
							>
								<div class="text-right">
									<i class="fas fa-angle-right"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="m-3">
					<p class="lead text-white">{{ milestone.title }}</p>
					<div class="m-0 text-justify text-white-75">
						<VueMarkdown
							:source="milestone.description"
							:anchorAttributes="{ target: '_blank' }"
						/>
					</div>
					<div class="d-flex flex-wrap">
						<button
							v-for="n in nodes"
							:key="n.id"
							class="btn btn-sm btn-primary mb-3 mb-md-2 mr-2 col-12 col-md-auto"
							@click="jump(n)"
						>
							<i class="far fa-hand-point-right mr-2"></i>
							{{ n.name }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
