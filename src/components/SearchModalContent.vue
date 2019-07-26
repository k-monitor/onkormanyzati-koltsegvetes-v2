<template>
	<div
		class="modal-dialog"
		role="document"
	>
		<div class="modal-content">
			<div class="modal-header align-items-center">
				<div class="input-group input-group-lg">
					<div class="input-group-prepend">
						<span
							class="input-group-text"
							id="inputGroup-sizing-lg"
						><i class="fas fa-search"></i></span>
					</div>
					<input
						aria-describedby="inputGroup-sizing-lg"
						aria-label="Sizing example input"
						class="form-control"
						type="text"
						v-model="searchTerm"
					>
				</div>
				<button
					class="close"
					type="button"
				>
					<i
						class="close fas fa-times-circle"
						data-dismiss="modal"
					></i>
				</button>
			</div>
			<div class="modal-body">
				<p
					class="text-center text-muted"
					v-if="results.length == 0"
				>
					<span v-if="searchTerm.length < 3">{{ $config.search.tooShort }}</span>
					<span v-else>{{ $config.search.noResults }}</span>
				</p>
				<div class="list-group">
					<div
						class="d-flex list-group-item"
						v-for="r in results"
						:key="r.side + r.type + r.id"
					>
						<div class="flex-grow-1 font-weight-bold mb-2">
							{{ r.name }}
							<br>
							<small class="text-muted">({{ $config.search[r.type] }})</small>
							<br>
							<span v-if="r.tags.length > 0">
								<span
									class="badge badge-info font-weight-normal mr-2"
									v-for="t in r.tags"
									:key="t"
								>#{{ t }}</span>
								<br>
							</span>
						</div>
						<div>
							<a
								class="mx-2 btn btn-sm"
								:class="r.side == 'income' ? 'btn-outline-success' : 'btn-outline-danger'"
								href="javascript:void(0)"
								@click="jump(r)"
							>
								<i class="far fa-hand-point-right"></i>
								<br>
								{{ $config.search[r.side] }}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import search from "~/search.js";

export default {
	props: ["year"],
	data() {
		return {
			searchTerm: ""
		};
	},
	computed: {
		results() {
			return this.searchTerm.length < 3
				? []
				: search(this.year, this.searchTerm)
						.sort(function(a, b) {
							return (b.value || 0) - (a.value || 0);
						})
						.filter(r => r.side != "income" || this.$config.modules.income);
		}
	},
	methods: {
		jump(result) {
			$("#search-modal").modal("hide");
			$("html, body").animate(
				{
					scrollTop: $("#" + result.side).offset().top - 72
				},
				1000,
				"easeInOutExpo"
			);
			const self = this;
			setTimeout(function() {
				self.$eventBus.$emit("jump", result);
			}, 1000);
		}
	},
	mounted() {
		const self = this;
		$("#search-modal").on("show.bs.modal", function(e) {
			self.searchTerm = "";
		});
		$("#search-modal").on("shown.bs.modal", function(e) {
			$("#search-modal input").focus();
		});
	}
};
</script>

