<template>
	<div class="d-flex">
		<div
			class="milestone d-flex align-items-end w-100"
			data-toggle="modal"
			:data-target="'#' + modalId(milestone.id)"
		>
			<div
				class="milestone-picture"
				:style="{ backgroundImage: 'url(' + milestone.picture + ')' }"
			></div>
			<h5 class="milestone-title text-center text-white w-100">{{ milestone.title }}</h5>
		</div>
		<div
			class="modal fade"
			:id="modalId(milestone.id)"
			tabindex="-1"
			role="dialog"
		>
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
										:id="videoId"
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
		</div>
	</div>
</template>

<script>
export default {
	props: ["milestone", "nextId", "prevId"],
	data() {
		return {
			playing: false
		};
	},
	computed: {
		videoId() {
			return this.modalId(this.milestone.id) + "-vid";
		}
	},
	methods: {
		modalId(milestoneId) {
			return "milestone-modal-" + milestoneId;
		},
		play() {
			this.playing = true;
		},
		prev() {
			$(".modal").modal("hide");
			$("#" + this.modalId(this.prevId)).modal("show");
		},
		next() {
			$(".modal").modal("hide");
			$("#" + this.modalId(this.nextId)).modal("show");
		}
	},
	mounted() {
		const self = this;
		$("#" + this.modalId(this.milestone.id)).on("hide.bs.modal", function(e) {
			self.playing = false;
		});
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "../scss/common";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.milestone-picture,
.milestone-modal-picture {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.milestone {
	cursor: pointer;
	transition: all 0.2s ease;

	.milestone-picture {
		filter: brightness(0.8);
		height: 100%;
		position: absolute;
		top: 0;
		transition: all 0.2s ease;
		width: 100%;
		z-index: -1;
	}

	.milestone-title {
		// https://cssgradient.io/
		$shadow: black;
		background: $shadow;
		background: -moz-linear-gradient(0deg, $shadow 0%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			$shadow 0%,
			rgba(0, 0, 0, 0) 100%
		);
		background: linear-gradient(0deg, $shadow 0%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);

		margin: 0;
		padding: 0.5rem 0;
		text-shadow: 0px 0px 5px black;
		transition: all 0.2s ease;
	}

	&:hover {
		.milestone-picture {
			filter: none;
		}

		.milestone-title {
			padding-bottom: 1rem;
		}
	}
}

.milestone-modal-picture i {
	cursor: pointer;
	text-shadow: 0px 0px 5px black;
}

.milestone-modal-picture {
	.next,
	.prev,
	.play {
		i {
			font-size: 2.5rem;
			@include media-breakpoint-up(sm) {
				font-size: 3rem;
			}
			@include media-breakpoint-up(md) {
				font-size: 3.5rem;
			}
			@include media-breakpoint-up(lg) {
				font-size: 4rem;
			}
		}
	}

	.z1 {
		z-index: 1;
	}
}
</style>

