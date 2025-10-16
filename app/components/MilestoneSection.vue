<script setup lang="ts">
import config from '~/data/config.json';
import milestonesJson from '~/data/milestones.json';

const { year } = defineProps<{ year: string }>();

const tag = ref<string | null>(null);

const milestones = computed(() =>
	Object.entries((milestonesJson as Milestones).milestones)
		.filter((e) => e[1].year == year)
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
	return milestones.value.filter((m) => !tag.value || (m.tags || []).includes(tag.value));
});

onMounted(() => {
	// FIXME test jquery stuff
	// TODO LATER jQuery -> Vue refactor
	const $ = window.$;

	document.onkeyup = function (e) {
		e = e || window.event;
		if (e.keyCode == 37) {
			$('.modal.show .prev').click();
		} else if (e.keyCode == 39) {
			$('.modal.show .next').click();
		}
	};

	// FIXME milestone event bus
	/*this.$eventBus.$on('ms', (id) => {
		this.tag = null;
		this.$nextTick(() => $('#milestone-modal-' + id).modal('show'));
	});*/
});
</script>

<template>
	<section class="page-section milestones">
		<div class="container-fluid">
			<div class="row">
				<div class="col text-center">
					<SectionHeading
						:title="config.milestones.title"
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
					/>
				</div>
			</div>
		</div>
	</section>
</template>
