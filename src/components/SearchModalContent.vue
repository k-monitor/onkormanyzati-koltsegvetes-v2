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
				<div class="list-group">
					<div
					 class="list-group-item"
					 type="button"
					 v-for="r in results"
					 :key="r.funcId"
					>
						<div class="font-weight-bold mb-2">
							{{ r.funcName }} {{ r.funcId }}
						</div>
						<div class="text-right">
							<a
							 class="mx-2 btn btn-sm btn-outline-success"
							 href="javascript:void(0)"
							 v-if="$config.modules.income"
							 @click="jumpToIncome(r.funcId)"
							>
								<i class="far fa-hand-point-right"></i>
								{{ $config.search.income }}
							</a>
							<a
							 class="mx-2 btn btn-sm btn-outline-danger"
							 href="javascript:void(0)"
							 @click="jumpToExpense(r.funcId)"
							>
								<i class="far fa-fw fa-hand-point-right"></i>
								{{ $config.search.expense }}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			searchTerm: ""
		};
	},
	computed: {
		results() {
			return this.searchTerm.trim().length < 3
				? []
				: Object.keys(this.$tags)
						.map(funcId => {
							const tags = this.$tags[funcId];
							const match = tags.filter(tag => tag.includes(this.searchTerm))
								.length;
							return {
								funcId,
								funcName: this.$functions[Number(funcId)],
								tags,
								match
							};
						})
						.filter(r => r.match > 0)
						.sort((a, b) => b.match - a.match)
						.slice(0, 5);
		}
	},
	methods: {
		jumpToExpense(funcId) {},
		jumpToIncome(funcId) {}
	},
	mounted() {
		const self = this;
		$("#search-modal").on("show.bs.modal", function(e) {
			self.searchTerm = "";
		});
		$("#search-modal").on("shown.bs.modal", function(e) {
			$("#search-modal input").focus();
			//TEST:
			//self.searchTerm = "menza";
		});
	}
};
</script>

