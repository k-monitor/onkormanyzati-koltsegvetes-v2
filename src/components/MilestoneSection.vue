<template>
	<section class="page-section milestones">
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="col text-center">
					<SectionHeading
						:title="$config.milestones.title"
						:year="year"
					/>
					<hr class="divider my-4 mb-5">
				</div>
			</div>
			<div class="row mb-5">
				<div
					class="col-md-6 col-lg-4 mx-auto px-0"
					v-for="(m, i) in milestones"
					:key="m.id"
				>
					<Milestone
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
	},
	mounted() {
		document.onkeyup = function(e) {
			e = e || window.event;
			if (e.keyCode == "37") {
				$(".modal.show .prev").click();
			} else if (e.keyCode == "39") {
				$(".modal.show .next").click();
			}
		};
	}
};
</script>