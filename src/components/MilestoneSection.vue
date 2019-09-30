<template>
	<section class="page-section milestones">
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="col text-center">
					<h2>
						{{ $config.milestones.title }}
						<small class="ml-1 text-muted">{{ year }}</small>
					</h2>
					<hr class="divider my-4 mb-5">
				</div>
			</div>
			<div class="row">
				<div
					class="col-md-6 col-lg-4 embed-responsive embed-responsive-16by9 mx-auto"
					v-for="(m, i) in milestones"
					:key="m.id"
				>
					<Milestone
						class="embed-responsive-item"
						:milestone="m"
						:nextId="milestones[(i + 1) % milestones.length].id"
						:prevId="milestones[(milestones.length + i - 1) % milestones.length].id"
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	props: ["year"],
	computed: {
		milestones() {
			return Object.entries(this.$milestones.milestones)
				.filter(e => {
					return e[1].year == this.year;
				})
				.map(e => {
					const m = e[1];
					m.id = e[0];
					return m;
				});
		}
	}
};
</script>