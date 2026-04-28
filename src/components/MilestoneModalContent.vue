<script setup lang="ts">
import search from '../utils/search';

const { milestone, modalId, nextModalId, prevModalId, mapModal } = defineProps<{
	milestone: MilestoneWithId;
	modalId: string;
	nextModalId: string;
	prevModalId: string;
	mapModal?: boolean;
}>();

const playing = ref(false);

const nodes = computed(() => {
	// TODO LATER search result type
	const nodes = [];
	milestone.nodeIds.forEach((id) => {
		const results = search(String(milestone.year), id, []).filter((r) => r.matchedId);
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

function jumpBudget(result) {
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

function jumpMap(result) {
	// TODO LATER search result type
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	// based on SearchModalContent.vue#jump
	$('.modal').modal('hide');
	if ($('#mainNav .show').length > 0) $('#mainNav button').click();

	scrollToElement($('#map'), 72);
	setTimeout(function () {
		eventBus.emit('jump_map', result);
	}, 1000);
}

function handleMarkdownClick(event: MouseEvent) {
	// Close modal when clicking a link in the markdown content
	const target = event.target as HTMLElement;
	if (target.tagName === 'A') {
		const $ = window.$;
		$('.modal').modal('hide');
	}
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
							v-if="milestone.vid && playing"
							class="h-100 position-absolute w-100"
						>
							<video
								:src="milestone.vid"
								autoplay
								class="h-100 w-100"
								loop
							/>
						</div>
						<div class="text-right w-100 small z1">
							<i
								class="far fa-times-circle fa-2x m-2"
								data-dismiss="modal"
							/>
						</div>
						<div class="d-flex flex-grow-1 w-100 z1">
							<div
								class="pl-3 w-25 d-flex flex-column justify-content-center prev"
								@click="prev()"
							>
								<div>
									<i class="fas fa-angle-left"/>
								</div>
							</div>
							<div class="d-flex flex-grow-1 play">
								<i
									v-if="milestone.vid && !playing"
									class="fas fa-play m-auto"
									@click="play()"
								/>
							</div>
							<div
								class="ml-auto pr-3 w-25 d-flex flex-column justify-content-center next"
								@click="next()"
							>
								<div class="text-right">
									<i class="fas fa-angle-right"/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="m-3">
					<p class="lead text-white">{{ milestone.title }}</p>
					<div
						v-for="n in nodes"
						:key="n.id"
						class="milestone-budget-card d-flex align-items-stretch mb-2"
						@click="jumpBudget(n)"
					>
						<div class="milestone-budget-accent bg-primary" />
						<div class="flex-grow-1 px-3 py-2">
							<div class="milestone-budget-label text-uppercase">
								{{ n.side === 'income' ? 'Bevétel' : 'Kiadás' }}
							</div>
							<div class="milestone-budget-amount">
								{{ groupNums(n.value, true, ['', 'ezer', 'millió', 'milliárd']) }}
							</div>
						</div>
						<div class="milestone-budget-link d-flex align-items-center text-primary font-weight-bold pr-3">
							{{ n.name }}
							<i class="fas fa-arrow-right ml-2" />
						</div>
					</div>
					<div class="m-0 text-justify text-white-75" @click="handleMarkdownClick">
						<VueMarkdown
							:source="milestone.description"
							:external-links-new-tab="true"
						/>
					</div>
					<div class="d-flex flex-wrap">
						<button
							v-if="milestone.position && !mapModal"
							class="btn btn-sm btn-primary mb-3 mb-md-2 mr-2 col-12 col-md-auto"
							@click="jumpMap(modalId.replace('milestone-modal-', ''))"
						>
							<i class="far fa-map mr-2"/>
							Térképen
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.milestone-budget-card {
	background-color: #f1f3f5;
	cursor: pointer;
	transition: background-color 0.15s ease;

	&:hover {
		background-color: #e9ecef;
	}
}

.milestone-budget-accent {
	flex: 0 0 6px;
	align-self: stretch;
}

.milestone-budget-label {
	color: #6c757d;
	font-size: 0.75rem;
	font-weight: 600;
	letter-spacing: 0.03em;
}

.milestone-budget-amount {
	color: #212529;
	font-size: 1.25rem;
	font-weight: 700;
}

.milestone-budget-link {
	white-space: nowrap;
}
</style>
