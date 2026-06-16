<script setup lang="ts">
const { year, handleMilestoneOpened, handleMilestoneClosed } = useYear();

const tag = ref<string | null>(null);

const milestones = computed(() =>
	Object.entries(MILESTONES)
		.filter((e) => e[1].year == year.value)
		.map((e) => ({ ...e[1], id: e[0] }) as MilestoneWithId),
);

const tags = computed(() => {
	const dict: Record<string, boolean> = {};
	milestones.value.forEach((m) => {
		(m.tags || []).forEach((t) => (dict[t] = true));
	});
	const tags = Object.keys(dict);
	tags.sort();
	return tags;
});

const filteredMilestones = computed(() => {
	return milestones.value.filter(
		(m) => !m.onlyOnMap && (!tag.value || (m.tags || []).includes(tag.value)),
	);
});

// Milestones hidden from the section (onlyOnMap). We still render their modals so they
// can be opened from the budget module (camera button) or search, even when the map
// module is disabled or no coordinates are set.
const hiddenMilestones = computed(() => milestones.value.filter((m) => m.onlyOnMap));


onMounted(() => {
	// TODO LATER eliminate jQuery
	const $ = window.$;

	document.onkeyup = function (e) {
		e = e || window.event;
		if (e.keyCode == 37) {
			$('.modal.show .prev').click();
		} else if (e.keyCode == 39) {
			$('.modal.show .next').click();
		}
	};

	eventBus.on('ms', (id) => {
		tag.value = null;
		nextTick(() => {
			const modal = $('#milestone-modal-' + id);
			modal.modal('show');
			handleMilestoneOpened(id);
		});
	});

	// Listen for modal show/hide events to update URL hash
	$(document).on('show.bs.modal', '.modal', function () {
		const modalId = $(this).attr('id');
		if (modalId?.startsWith('milestone-modal-')) {
			const milestoneId = modalId.replace('milestone-modal-', '');
			handleMilestoneOpened(milestoneId);
		}
	});

	$(document).on('hide.bs.modal', '.modal', function () {
		const modalId = $(this).attr('id');
		if (modalId?.startsWith('milestone-modal-')) {
			handleMilestoneClosed();
		}
	});
});
</script>

<template>
	<section class="page-section milestones">
		<div class="container-fluid">
			<div class="row">
				<div class="col text-center">
					<SectionHeading
						:title="CONFIG.milestones.title"
						:year="year"
					/>
					<hr class="divider my-4 mb-5" />
				</div>
			</div>
			<div
				class="row mb-4"
				v-if="tags.length"
			>
				<div class="col text-center">
					<a
						class="btn btn-sm btn-light m-2"
						:class="!tag ? 'btn-primary' : 'btn-light'"
						href="javascript:void(0)"
						@click="tag = null"
						>Összes</a
					>
					<a
						v-for="t in tags"
						:key="t"
						class="btn btn-sm btn-light m-2"
						:class="tag === t ? 'btn-primary' : 'btn-light'"
						href="javascript:void(0)"
						@click="tag = t"
						>{{ t }}</a
					>
				</div>
			</div>
			<div class="row mb-5">
				<div
					class="col-md-6 col-lg-4 mx-auto px-1"
					:class="{ 'd-none': tag && !(m.tags || []).includes(tag) }"
					v-for="(m, i) in filteredMilestones"
					:key="m.id"
				>
					<Milestone
						:milestone="m"
						:nextId="filteredMilestones[(i + 1) % filteredMilestones.length]?.id || ''"
						:prevId="
							filteredMilestones[
								(filteredMilestones.length + i - 1) % filteredMilestones.length
							]?.id || ''
						"
						:mapModal="false"
					/>
				</div>
			</div>
			<!-- Modals for milestones hidden from the section (onlyOnMap), so they can still
			     be opened from the budget module or search. No cards are rendered. -->
			<Milestone
				v-for="m in hiddenMilestones"
				:key="'hidden-' + m.id"
				:milestone="m"
				:next-id="''"
				:prev-id="''"
				:modal-only="true"
			/>
		</div>
	</section>
</template>
