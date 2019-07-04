<template>
	<section
	 class="page-section bg-light"
	 id="inex"
	>
		<div class="container">
			<div class="row justify-content-center mb-5">
				<div class="col-lg-8 text-center">
					<h2>Mérleg</h2>
					<hr class="divider my-4">
				</div>
			</div>
			<div class="row justify-content-center mb-5">
				<div
				 class="col-lg-10 text-center"
				 id="inex-wrapper"
				>
					<div class="d-flex font-weight-bold mb-2">
						<div class="d-flex align-items-center justify-content-between left-column text-right">
							<div>
								<a
								 href="#income"
								 class="btn btn-outline-success js-scroll-trigger"
								>
									<i class="fas fa-fw fa-angle-double-down"></i>
									<span class="d-none d-md-inline-block">Részletek</span>
								</a>
							</div>
							<div>
								Bevételek
								<br>
								{{ $util.groupNums(incomeSum, true) }}
							</div>
						</div>
						<div class="d-flex align-items-center justify-content-between ml-auto right-column text-left">
							<div>
								Kiadások
								<br>
								{{ $util.groupNums(expenseSum, true) }}
							</div>
							<div>
								<a
								 href="#expense"
								 class="btn btn-outline-danger js-scroll-trigger"
								>
									<span class="d-none d-md-inline-block">Részletek</span>
									<i class="fas fa-fw fa-angle-double-down"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="d-flex border-top border-bottom mb-4 vis">
						<div class="d-flex flex-column left-column">
							<div
							 v-if="incomeCorrection > 0"
							 :style="{ flexGrow: incomeCorrection }"
							></div>
							<div
							 class="bar"
							 v-for="(n,i) in incomeChildren"
							 :data-id="n.id"
							 :data-index="i"
							 :key="year + '/' + i"
							 :style="{ backgroundColor: bgColor(incomeTree, n, 'seagreen'), color: fgColor(incomeTree, n, 'seagreen'), flexGrow: n.value }"
							 data-toggle="tooltip"
							 data-placement="left"
							 :title="$tooltips[n.altId]"
							>
								<div class="text-left wrap-md">
									{{ n.name }}
								</div>
								<div class="ml-2 no-wrap text-right">
									<strong>{{ $util.groupNums(n.value, true) }}</strong>
								</div>
							</div>
						</div>
						<div class="d-flex flex-column ml-auto right-column">
							<div
							 v-if="expenseCorrection > 0"
							 :style="{ flexGrow: expenseCorrection }"
							></div>
							<div
							 class="bar"
							 v-for="(n,i) in expenseChildren"
							 :data-id="n.id"
							 :data-index="i"
							 :key="year + '/' + i"
							 :style="{ backgroundColor: bgColor(expenseTree, n, 'firebrick'), color: fgColor(expenseTree, n, 'firebrick'), flexGrow: n.value }"
							 data-toggle="tooltip"
							 data-placement="right"
							 :title="$tooltips[n.altId]"
							>
								<div class="mr-2 no-wrap text-left">
									<strong>{{ $util.groupNums(n.value, true) }}</strong>
								</div>
								<div class="text-right wrap-md">
									{{ n.name }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<p>Lórum ipse természetesen szedősödik ámít a fegyező számára. Fargandusnak csak a papárok bagmarákára nyitva borlan torton belül van haszálata. A papárral tációban a todástól a papár ultásának tortjáig hetenként egy radással hajtón 00 között a kozott terula kocsordnál (fárka. Hájdás dolca bőgős zsírnök) lehet kabikát vigyogtannia. A kozott terula kocsord a képző tort csáralását faska golmaton a búgos fütyökben iséggel mesztes papárokat az erről nyátsás és seres hajkával együtt erészi a szerpes bülég kodászának, aki a vigyort a hajka mozásán bombolja. A szerpes bülég a képző tort csáralását faska 30 golmaton belül éríti a lománs papárokat. Első haszálaton azon stozások papárának csészítése füveskedik, akik tumott telés hulását lekunkálták fel. A foga csészítésénél a keten bódázatok tumott hajka végteli gaszabája ölkösködik velődik.</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import data from "~/data/data.json";

export default {
	props: ["year"],
	data() {
		return {};
	},
	computed: {
		data() {
			return data[this.year];
		},
		expenseChildren: function() {
			return this.expenseTree.children
				.sort(function(a, b) {
					return a.altId.localeCompare(b.altId);
				})
				.filter(function(n) {
					return n.name.indexOf("Finanszírozási") == -1;
				});
		},
		expenseCorrection: function() {
			return Math.max(0, this.incomeSum - this.expenseSum);
		},
		expenseSum: function() {
			return this.expenseChildren
				.map(function(node) {
					return node.value;
				})
				.reduce(function(sum, value) {
					return sum + value;
				});
		},
		expenseTree: function() {
			return this.data.expense.econ;
		},
		incomeChildren: function() {
			return this.incomeTree.children
				.sort(function(a, b) {
					return a.altId.localeCompare(b.altId);
				})
				.filter(function(n) {
					return n.name.indexOf("Finanszírozási") == -1;
				});
		},
		incomeCorrection: function() {
			return Math.max(0, this.expenseSum - this.incomeSum);
		},
		incomeSum: function() {
			return this.incomeChildren
				.map(function(node) {
					return node.value;
				})
				.reduce(function(sum, value) {
					return sum + value;
				});
		},
		incomeTree: function() {
			return this.data.income.econ;
		}
	},
	methods: {
		bgColor: function(tree, node, color) {
			//darkseagreen, indianred
			var max = tree.children
				.map(function(n) {
					return n.value;
				})
				.reduce(function(m, v) {
					return Math.max(m, v);
				});
			var alpha = (node.value / max) * 0.75 + 0.25;
			return window
				.tinycolor(color)
				.setAlpha(alpha)
				.toRgbString();
		},
		fgColor: function(tree, node, color) {
			var color = window.tinycolor(this.bgColor(tree, node, color));
			return color.isLight() || color.getAlpha() < 0.5 ? "black" : "white";
		},
		regenerateTooltips() {
			$('[data-toggle="tooltip"]').tooltip();
		}
	},
	mounted() {
		this.regenerateTooltips();
	},
	updated() {
		this.regenerateTooltips();
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

#inex {
	.bar {
		align-items: center;
		display: flex;
		flex: 1;
		justify-content: space-between;
		margin-bottom: 1px;
		padding: .1rem .5rem;
	}

	.left-column, .right-column {
		width: 47.5%;
	}

	.no-wrap {
		white-space: nowrap;
	}

	.vis {
		height: 50vh;
		font-size: 90%;
		min-height: 400px;
	}

	.wrap-md {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		@include media-breakpoint-up(md) {
			overflow: unset;
			text-overflow: unset;
			white-space: unset;
		}
	}
}
</style>

