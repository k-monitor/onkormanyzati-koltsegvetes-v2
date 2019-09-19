<template>
	<section class="page-section bg-light">
		<div class="container">
			<div class="row justify-content-center mb-5">
				<div class="col-lg-8 text-center">
					<h2>
						{{ $config.inex.title }}
						<small class="ml-1 text-muted">{{ year }}</small>
					</h2>
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
									<span class="d-none d-md-inline-block">{{ $config.inex.details }}</span>
								</a>
							</div>
							<div>
								{{ $config.inex.income }}
								<br>
								{{ $util.groupNums(incomeSum, true) }}
							</div>
						</div>
						<div class="d-flex align-items-center justify-content-between ml-auto right-column text-left">
							<div>
								{{ $config.inex.expense }}
								<br>
								{{ $util.groupNums(expenseSum, true) }}
							</div>
							<div>
								<a
								 href="#expense"
								 class="btn btn-outline-danger js-scroll-trigger"
								>
									<span class="d-none d-md-inline-block">{{ $config.inex.details }}</span>
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
							 :style="{ backgroundColor: bgColor(n, true), color: fgColor(n, true), flexGrow: n.value }"
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
							 :style="{ backgroundColor: bgColor(n, false), color: fgColor(n, false), flexGrow: n.value }"
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
					<p>{{ $config.inex.text }}</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import tinycolor from "tinycolor2";

export default {
	props: ["year"],
	data() {
		return {};
	},
	computed: {
		data() {
			return this.$d[this.year];
		},
		expenseChildren: function() {
			return this.expenseTree.children
				.sort(function(a, b) {
					return a.altId.localeCompare(b.altId);
				})
				.filter(function(n) {
					return n.name.indexOf("Finanszírozási") == -1;
				})
				.map(function(n) {
					const i = parseInt(n.altId[1]);
					n.mukodesi = i <= 5;
					return n;
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
			const customOrder = ["B1", "B3", "B4", "B6", "B2", "B5", "B7"];
			return this.incomeTree.children
				.sort(function(a, b) {
					return customOrder.indexOf(a.altId) - customOrder.indexOf(b.altId);
				})
				.filter(function(n) {
					return n.name.indexOf("Finanszírozási") == -1;
				})
				.map(function(n) {
					const i = parseInt(n.altId[1]);
					n.mukodesi = [1, 3, 4, 6].indexOf(i) > -1;
					return n;
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
		bgColor: function(node, isIncome) {
			var color = isIncome ? 'aquamarine' : 'coral';
			return tinycolor(color).spin(node.mukodesi ? 0 : 180);
		},
		fgColor: function(node, isIncome) {
			var color = tinycolor(this.bgColor(node, isIncome));
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
		padding: 0.1rem 0.5rem;
	}

	.left-column,
	.right-column {
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
