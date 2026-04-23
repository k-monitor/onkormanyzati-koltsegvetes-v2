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
		</div>
	</section>
</template>
