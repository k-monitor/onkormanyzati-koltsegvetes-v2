<script setup lang="ts">
const { year, handleMilestoneOpened } = useYear();

const tag = ref<string | null>(null);

const milestones = computed(() => MILESTONES_BY_YEAR[year.value] || []);

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

// Milestones hidden from the grid (onlyOnMap) are opened from the chart via the
// 'ms' event. A year can have ~1000 of them, so rather than rendering a modal for
// each (which froze the page and made year switches slow), we render a single
// on-demand host modal and swap its milestone in place. This list only drives
// prev/next cycling now, not rendering.
const mapOnlyMilestones = computed(() =>
	milestones.value.filter((m) => m.onlyOnMap),
);

const MAP_ONLY_MODAL_ID = 'milestone-modal-maponly';
const activeMapOnly = ref<MilestoneWithId | null>(null);

function openMapOnly(id: string) {
	const raw = MILESTONES[id];
	if (!raw) return;
	activeMapOnly.value = { ...raw, id };
	// Wait for the host modal to (re)render with this milestone, then show it.
	nextTick(() => window.$('#' + MAP_ONLY_MODAL_ID).modal('show'));
}

function navigateMapOnly(direction: 'prev' | 'next') {
	const list = mapOnlyMilestones.value;
	if (!list.length) return;
	const i = list.findIndex((m) => m.id === activeMapOnly.value?.id);
	const base = i < 0 ? 0 : i;
	const j =
		direction === 'next'
			? (base + 1) % list.length
			: (list.length + base - 1) % list.length;
	const target = list[j];
	if (!target) return;
	activeMapOnly.value = target;
	handleMilestoneOpened(target.id);
}

const msHandler = (id: string) => {
	tag.value = null;
	nextTick(() => {
		// A grid card already renders this milestone's modal — show it directly.
		// Otherwise it's an onlyOnMap milestone: route it through the host modal.
		if (document.getElementById('milestone-modal-' + id)) {
			window.$('#milestone-modal-' + id).modal('show');
			handleMilestoneOpened(id);
		} else {
			openMapOnly(id);
		}
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

			<!-- Single on-demand modal for onlyOnMap milestones (no grid card),
			     openable from the chart. prev/next swap its milestone in place. -->
			<Milestone
				v-if="activeMapOnly"
				:milestone="activeMapOnly"
				:next-id="''"
				:prev-id="''"
				:modal-only="true"
				:modal-id-override="MAP_ONLY_MODAL_ID"
				:navigate="navigateMapOnly"
			/>
		</div>
	</section>
</template>
