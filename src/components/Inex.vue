<template>
	<section class="page-section bg-light">
		<div class="container">
			<div class="row justify-content-center mb-5">
				<div class="col-lg-8 text-center">
					<SectionHeading
						:title="$config.inex.title"
						:year="year"
					/>
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
									<span class="d-none d-md-inline-block">{{ $config.vis.income }}</span>
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
									<span class="d-none d-md-inline-block">{{ $config.vis.expense }}</span>
									<i class="fas fa-fw fa-angle-double-down"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="d-flex border-top border-bottom mb-4 vis">
						<div class="bg-success side"></div>
						<div class="d-flex flex-column left-column">
							<div
								class="bar"
								:class="{ small: isNodeSmall(n, incomeTree) }"
								v-for="(n,i) in incomeGrayNodes.concat(incomeChildren)"
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
								v-for="(n,i) in expenseGrayNodes.concat(expenseChildren)"
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
					<VueMarkdown :source="$config.inex.text" />
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
		expenseChildren: function () {
			return this.expenseTree.children
				.sort(function (a, b) {
					return a.id.localeCompare(b.id);
				})
				.filter(function (n) {
					return n.name.indexOf("Finanszírozási") == -1;
				})
				.map(function (n) {
					const i = parseInt(n.id[1]);
					n.mukodesi = i <= 5;
					return n;
				})
				.filter(function (n) {
					return n.value > 0;
				});
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
		grayFB: function () {
			return {
				id: "FB",
				gray: true,
				name: "Alaptevékenység finanszírozási egyenlege",
				value: this.grayRE.value - (this.incomeSum - this.expenseSum),
			};
		},
		grayRE: function () {
			return {
				id: "RE",
				gray: true,
				name: "Alaptevékenység szabad maradványa",
				value: this.data.income.econ.value - this.data.expense.econ.value,
			};
		},
		expenseGrayNodes: function () {
			const r = [];
			if (this.grayFB.value < 0) {
				r.push(this.grayFB);
			}
			if (this.grayRE.value > 0) {
				r.push(this.grayRE);
			}
			return r;
		},
		incomeGrayNodes: function () {
			return this.grayFB.value > 0 ? [this.grayFB] : [];
		},
		incomeChildren: function () {
			const customOrder = ["B1", "B3", "B4", "B6", "B2", "B5", "B7"];
			return this.incomeTree.children
				.sort(function (a, b) {
					return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
				})
				.filter(function (n) {
					return n.name.indexOf("Finanszírozási") == -1;
				})
				.map(function (n) {
					const i = parseInt(n.id[1]);
					n.mukodesi = [1, 3, 4, 6].indexOf(i) > -1;
					return n;
				})
				.filter(function (n) {
					return n.value > 0;
				});
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
			if (node.gray) return tinycolor("gainsboro");
			return tinycolor("seagreen")
				.spin((node.mukodesi ? 1 : 2) * 71)
				.desaturate(30)
				.brighten(35);
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
</style>
