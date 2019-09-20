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
						aria-label="Search"
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
							<span v-html="r.name"></span>
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
								class="ml-2 btn btn-sm"
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
			searchTerm: "",
			savedSearchTerms: []
		};
	},
	computed: {
		results() {
			return this.searchTerm.length < 3
				? []
				: search(this.year, this.searchTerm)
						.filter(r => r.side != "income" || this.$config.modules.income)
						.sort(function(a, b) {
							function score(r) {
								return (r.matchesInName || 0) + (r.tags || []).length;
							}
							const sa = score(a);
							const sb = score(b);
							return sa == sb ? (b.value || 0) - (a.value || 0) : sb - sa;
						})
						.map(r => {
							this.searchTerm.split(" ").forEach(t => {
								t = t.trim();
								if (t.length >= 3) {
									r.name = r.name.replace(
										new RegExp(`(${t})`, "i"),
										"<u>$1</u>"
									);
								}
							});
							return r;
						})
						.slice(0, 5);
		}
	},
	watch: {
		searchTerm(term, oldTerm) {
			clearTimeout(window.searchTimeout);
			const self = this;

			const track = function(term) {
				const prefix = self.savedSearchTerms.some(
					sst => sst.indexOf(term) == 0
				);
				if (!prefix) {
					self.savedSearchTerms.push(term);
					const url = `/track-search.php?t=${term}&r=${
						search(self.year, term).length
					}`;
					$.get(url);
				}
			};
			if (term.length == oldTerm.length - 1) {
				// immediate reaction to backspace
				track(oldTerm);
			} else if (term.length >= 3) {
				window.searchTimeout = setTimeout(function() {
					track(term);
				}, 1000);
			}
		}
	},
	methods: {
		jump(result) {
			$("#search-modal").modal("hide");
			if ($('#mainNav .show').length > 0) $('#mainNav button').click();
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

