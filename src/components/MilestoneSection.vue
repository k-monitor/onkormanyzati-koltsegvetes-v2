<script setup lang="ts">
const { year, handleMilestoneOpened } = useYear();

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

// Milestones hidden from the grid (onlyOnMap) still need their modals rendered
// so they can be opened from the expenses/revenues chart via the 'ms' event.
const mapOnlyMilestones = computed(() =>
	milestones.value.filter((m) => m.onlyOnMap),
);

const msHandler = (id: string) => {
	tag.value = null;
	nextTick(() => {
		const $ = window.$;
		const modal = $('#milestone-modal-' + id);
		modal.modal('show');
		handleMilestoneOpened(id);
	});
};

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

	eventBus.on('ms', msHandler);
});

onUnmounted(() => {
	document.onkeyup = null;
	eventBus.off('ms', msHandler);
});
</script>

<template>
	<section class="page-section milestones">
		<div class="container">
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
				v-if="tags.length"
				class="row"
			>
				<div class="col text-center">
					<ul class="justify-content-center mb-5 nav nav-pills w-100">
						<li class="nav-item">
							<a
								class="nav-link"
								:class="{ active: !tag }"
								href="javascript:void(0)"
								@click="tag = null"
								>Összes</a
							>
						</li>
						<li
							v-for="t in tags"
							:key="t"
							class="nav-item"
						>
							<a
								class="nav-link"
								:class="{ active: tag === t }"
								href="javascript:void(0)"
								@click="tag = t"
								>{{ t }}</a
							>
						</li>
					</ul>
				</div>
			</div>
			<div class="row mb-5">
				<div
					v-for="(m, i) in filteredMilestones"
					:key="m.id"
					class="col-md-6 col-lg-4 mx-auto px-1"
					:class="{ 'd-none': tag && !(m.tags || []).includes(tag) }"
				>
					<Milestone
						:milestone="m"
						:next-id="filteredMilestones[(i + 1) % filteredMilestones.length]?.id || ''"
						:prev-id="
							filteredMilestones[
								(filteredMilestones.length + i - 1) % filteredMilestones.length
							]?.id || ''
						"
						:map-modal="false"
					/>
				</div>
			</div>

			<!-- Modals for onlyOnMap milestones (no grid card), openable from the chart -->
			<Milestone
				v-for="(m, i) in mapOnlyMilestones"
				:key="m.id"
				:milestone="m"
				:next-id="mapOnlyMilestones[(i + 1) % mapOnlyMilestones.length]?.id || ''"
				:prev-id="
					mapOnlyMilestones[
						(mapOnlyMilestones.length + i - 1) % mapOnlyMilestones.length
					]?.id || ''
				"
				:modal-only="true"
			/>
		</div>
	</section>
</template>
