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
						<VueMarkdown :source="milestone.description" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ["milestone", "modalId", "nextModalId", "prevModalId"],
	data() {
		return {
			playing: false
		};
	},
	methods: {
		play() {
			this.playing = true;
		},
		prev() {
			$(".modal").modal("hide");
			const self = this;
			setTimeout(function() {
				$("#" + self.prevModalId).modal("show");
			}, 325);
		},
		next() {
			$(".modal").modal("hide");
			const self = this;
			setTimeout(function() {
				$("#" + self.nextModalId).modal("show");
			}, 325);
		}
	},
	mounted() {
		const self = this;
		$("#" + this.modalId).on("hide.bs.modal", function(e) {
			self.playing = false;
		});
	}
};
</script>