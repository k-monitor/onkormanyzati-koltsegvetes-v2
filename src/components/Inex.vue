<template>
	<section class="page-section bg-light">
		<div class="container">
			<div class="row justify-content-center mb-5">
				<div class="col-lg-8 text-center">
					<SectionHeading
						:title="$config.inex.title"
						:year="year"
					/>
					<hr class="divider my-4" />
				</div>
			</div>
			<div class="row justify-content-center mb-5">
				<div
					class="col-lg-10 text-center"
					id="inex-wrapper"
				>
					<div class="d-flex font-weight-bold mb-2">
						<div>
							<a
								href="#income"
								class="btn btn-outline-success js-scroll-trigger"
							>
								<i class="fas fa-fw fa-angle-double-down"></i>
								<span class="d-none d-md-inline-block">{{ $config.vis.income }}</span>
							</a>
						</div>
						<div class="mx-auto">
							<span>{{ $config.inex.subtitle }}</span>
							<br>
							<span>{{ $util.groupNums(Math.max(incomeSum, expenseSum), true) }}</span>
						</div>
						<div>
							<a
								href="#expense"
								class="btn btn-outline-danger js-scroll-trigger"
							>
								<span class="d-none d-md-inline-block">{{ $config.vis.expense }}</span>
								<i class="fas fa-fw fa-angle-double-down"></i>
							</a>
						</div>
					</div>
					<div class="d-flex border-top border-bottom mb-4 vis">
						<div class="bg-success side"></div>
						<div class="d-flex flex-column left-column">
							<div
								class="bar"
								:class="{ small: isNodeSmall(n, incomeTree) }"
								v-for="(n,i) in incomeChildren"
								:data-id="n.id"
								:data-index="i"
								:key="year + '/' + i"
								:style="{ backgroundColor: bgColor(n, true), color: fgColor(n, true), flexGrow: n.value }"
								data-toggle="tooltip"
								data-placement="left"
								data-html="true"
								:title="'<b>' + n.name + ' (' + $util.groupNums(n.value, true) + ')</b>: ' + ($tooltips[year][n.id] || '')"
								oncontextmenu="return false;"
							>
								<div class="text-left">
									{{ n.name }}
								</div>
								<div class="value ml-2 no-wrap text-right">
									<strong>{{ $util.groupNums(n.value, true) }}</strong>
								</div>
							</div>
						</div>
						<div class="d-flex flex-grow-1 align-items-center justify-content-center">
							<i class="d-block d-md-none fas fa-arrow-right fa-2x text-muted"></i>
							<i class="d-none d-md-block fas fa-arrow-right fa-4x text-muted"></i>
						</div>
						<div class="d-flex flex-column right-column">
							<div
								class="bar"
								:class="{ small: isNodeSmall(n, expenseTree) }"
								v-for="(n,i) in expenseChildren"
								:data-id="n.id"
								:data-index="i"
								:key="year + '/' + i"
								:style="{ backgroundColor: bgColor(n, false), color: fgColor(n, false), flexGrow: Math.abs(n.value) }"
								data-toggle="tooltip"
								data-placement="right"
								data-html="true"
								:title="'<b>' + n.name + ' (' + $util.groupNums(n.value, true) + ')</b>: ' + ($tooltips[year][n.id] || '')"
								oncontextmenu="return false;"
							>
								<div class="value mr-2 no-wrap text-left">
									<strong>{{ $util.groupNums(n.value, true) }}</strong>
								</div>
								<div class="flex-grow-1 text-right">
									{{ n.name }}
								</div>
							</div>
						</div>
						<div class="bg-danger side"></div>
					</div>
				</div>
				<p class="d-md-none font-italic p-3 small text-center text-muted">Érintőképernyős eszközökön a kategória leírások megjelenítéséhez tartsa az ujját a hasábon egy kis ideig.</p>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-8 text-center">
					<VueMarkdown
						:source="$config.inex.text"
						:class="{ less: less, more: !less }"
					/>
					<div class="border-top">
						<button
							class="btn btn-sm btn-link text-decoration-none"
							@click="less=!less"
						>
							<span v-if="less">
								<i class="fas fa-chevron-down mr-2"></i>
								Mutass többet!
								<i class="fas fa-chevron-down ml-2"></i>
							</span>
							<span v-else>
								<i class="fas fa-chevron-up mr-2"></i>
								Mutass kevesebbet!
								<i class="fas fa-chevron-up ml-2"></i>
							</span>
						</button>
					</div>
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
		return {
			less: true,
		};
	},
	computed: {
		data() {
			return this.$d[this.year];
		},
		expenseChildren: function () {
			return this.$config.inex.expenseNodes
				.split(",")
				.map(
					(id) => this.expenseTree.children.filter((n) => n.id === id.trim())[0]
				)
				.filter((n) => n && n.id && n.value && Math.abs(n.value) > 0);
		},
		expenseSum: function () {
			return this.expenseChildren
				.map(function (node) {
					return node.value;
				})
				.reduce(function (sum, value) {
					return sum + value;
				}, 0);
		},
		expenseTree: function () {
			return this.data.expense.econ;
		},
		incomeChildren: function () {
			return this.$config.inex.incomeNodes
				.split(",")
				.map(
					(id) => this.incomeTree.children.filter((n) => n.id === id.trim())[0]
				)
				.filter((n) => n && n.id && n.value && n.value > 0);
		},
		incomeSum: function () {
			return this.incomeChildren
				.map(function (node) {
					return node.value;
				})
				.reduce(function (sum, value) {
					return sum + value;
				}, 0);
		},
		incomeTree: function () {
			return this.data.income.econ;
		},
	},
	methods: {
		bgColor: function (node, isIncome) {
			const defaultColor = isIncome ? '#bde2cd' : '#ffb5b5';
			return this.$config.inex[node.id] || defaultColor;
		},
		fgColor: function (node, isIncome) {
			var color = tinycolor(this.bgColor(node, isIncome));
			return color.isLight() || color.getAlpha() < 0.5 ? "black" : "white";
		},
		isNodeSmall: function (node, tree) {
			var max = tree.children
				.map(function (n) {
					return n.value;
				})
				.reduce(function (m, v) {
					return Math.max(m, v);
				});
			return Math.abs(node.value) < max * 0.1;
		},
		regenerateTooltips() {
			$('[data-toggle="tooltip"]').tooltip();
		},
	},
	mounted() {
		this.regenerateTooltips();
	},
	updated() {
		this.regenerateTooltips();
	},
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
		border-bottom: 1px solid white;
		padding: 0.1rem;
		@include media-breakpoint-up(md) {
			padding: 0.1rem 0.5rem;
		}
		user-select: none;

		&.small {
			padding: 0.33rem 0.5rem;
			div {
				display: none;
			}
		}
	}

	.left-column,
	.right-column {
		width: 45%;
	}

	.no-wrap {
		white-space: nowrap;
	}

	.side {
		width: 0.5rem;
	}

	.vis {
		font-size: 90%;
		height: 75vh;
		line-height: 1.15;
		min-height: 400px;

		@include media-breakpoint-up(md) {
			height: 50vh;
			line-height: inherit;
		}
	}

	.value {
		display: none;

		@include media-breakpoint-up(md) {
			:not(.small) & {
				display: block;
			}
		}
	}
}

.less {
	max-height: 110px;
	overflow-y: hidden;
	position: relative;
}
.less::after {
	box-shadow: inset 0px -40px 30px -30px $light;
	content: "";
	display: block;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	position: absolute;
}
.more + div {
	border-top-color: transparent !important;
}
</style>