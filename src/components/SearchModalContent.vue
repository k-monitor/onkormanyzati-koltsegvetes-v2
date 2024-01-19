<template>
	<div
		class="modal-dialog modal-lg"
		role="document"
	>
		<div class="modal-content">
			<div class="modal-header">
				<div class="d-flex flex-column flex-grow-1">
					<div class="input-group mb-3">
						<div class="input-group-prepend">
							<span
								class="input-group-text"
								id="searchTerm-label"
							><i class="fas fa-fw fa-search"></i></span>
						</div>
						<input
							aria-describedby="searchTerm-label"
							aria-label="Szöveges keresés"
							class="form-control"
							placeholder="Kulcsszó..."
							type="text"
							v-model="searchTerm"
						>
					</div>
					<div class="input-group">
						<div class="input-group-prepend">
							<span
								class="input-group-text"
								id="valueTerm-label"
							><i class="fas fa-fw fa-money-bill-wave"></i></span>
						</div>
						<input
							aria-describedby="valueTerm-label"
							aria-label="Szűrés érték szerint"
							class="form-control"
							placeholder="Érték vagy tartomány... (pl. 10-20)"
							type="text"
							v-model="valueTerm"
						>
						<div class="input-group-append">
							<div class="dropdown">
								<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									{{ suffix.label }}
								</button>
								<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
									<a
										v-for="s in suffixes"
										:key="s.value"
										class="dropdown-item"
										href="javascript:void(0)"
										@click="suffix = s"
										v-text="s.label"
									/>
								</div>
							</div>
						</div>
					</div>
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
							<span>
								<span v-html="r.name"></span>
								<span
									v-if="r.value"
									class="ml-1 text-nowrap text-secondary"
								>
									({{ $util.groupNums(r.value, true) }})
								</span>
							</span>
							<br>

							<small class="text-muted">({{ $config.search[r.type] }})</small>
							<br>
							<span v-if="(r.tags || '').length > 0">
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
								:class="r.side == 'milestones' ? 'btn-outline-info' : (r.side == 'income' ? 'btn-outline-success' : 'btn-outline-danger')"
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

const suffixes = [
	{ label: "ezer Ft", value: 1000 },
	{ label: "millió Ft", value: 1000000 },
	{ label: "milliárd Ft", value: 1000000000 },
];

export default {
	props: ["year"],
	data() {
		return {
			searchTerm: "",
			savedSearchTerms: [],
			valueTerm: "",
			suffix: suffixes[1],
			suffixes,
		};
	},
	computed: {
		range() {
			const valueSearch = this.valueTerm.match(/^\d+(-\d+)?$/);
			if (!valueSearch) return [];
			const parts = this.valueTerm.split("-");
			const min = parseInt(parts[0], 10);
			const max = parseInt(parts[1] || parts[0], 10);
			const res =  min === max ? [min] : [min, max];
			return res.map((r) => r * this.suffix.value);
		},
		results() {
			if (this.searchTerm.length < 3 && this.range.length == 0) return [];
			const valueSearch = this.range.length > 0;
			return search(this.year, this.searchTerm, this.range)
				.filter((r) => r.side != "income" || this.$config.modules.income)
				.sort(function (a, b) {
					function score(r) {
						if (r.matchedId) return 1000;
						if (valueSearch) return r.distance * -1;
						return (r.matchesInName || 0) + (r.tags || []).length;
					}
					const sa = score(a);
					const sb = score(b);
					return sa == sb ? (b.value || 0) - (a.value || 0) : sb - sa;
				})
				.map((r) => {
					this.searchTerm.split(" ").forEach((t) => {
						t = t.trim();
						if (t.length >= 3) {
							r.name = (r.name || '').replace(
								new RegExp(`(${t})`, "i"),
								"<u>$1</u>"
							);
						}
					});
					return r;
				})
				.slice(0, 5);
		},
	},
	watch: {
		searchTerm(term, oldTerm) {
			clearTimeout(window.searchTimeout);
			const self = this;

			const track = function (term) {
				const prefix = self.savedSearchTerms.some(
					(sst) => sst.indexOf(term) == 0
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
				window.searchTimeout = setTimeout(function () {
					track(term);
				}, 1000);
			}
		},
	},
	methods: {
		jump(result) {
			$("#search-modal").modal("hide");
			if ($("#mainNav .show").length > 0) $("#mainNav button").click();
			$("html, body").animate(
				{
					scrollTop: $("#" + result.side).offset().top - 72,
				},
				1000,
				"easeInOutExpo"
			);
			const self = this;
			setTimeout(function () {
				if (result.side === "milestones") {
					self.$eventBus.$emit("ms", result.id);
				} else {
					self.$eventBus.$emit("jump", result);
				}
			}, 1000);
		},
	},
	mounted() {
		const self = this;
		$("#search-modal").on("show.bs.modal", function (e) {
			self.searchTerm = "";
		});
		$("#search-modal").on("shown.bs.modal", function (e) {
			$("#search-modal input").focus();
		});
	},
};
</script>

