<template>
	<div class="visualization">
		<div class="row justify-content-center">
			<div
				class="col-lg-8 text-center"
				v-if="data.econ && data.func"
			>
				<ul class="justify-content-center mb-5 nav nav-pills w-100">
					<li class="nav-item">
						<a
							:class="{ active: mode == 1 }"
							:title="$config.vis.funcHint"
							@click="path = []; mode = 1"
							class="nav-link"
							data-placement="bottom"
							data-toggle="tooltip"
							href="javascript:void(0)"
						>
							{{ $config.vis.func }}
						</a>
					</li>
					<li class="nav-item">
						<a
							:class="{ active: mode == 0 }"
							:title="$config.vis.econHint"
							@click="path = []; mode = 0"
							class="nav-link"
							data-placement="bottom"
							data-toggle="tooltip"
							href="javascript:void(0)"
						>
							{{ $config.vis.econ }}
						</a>
					</li>
				</ul>
			</div>
		</div>

		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li
					class="breadcrumb-item"
					v-for="(n,i) in nodePath"
					:key="i"
					:class="{ active: i == nodePath.length - 1 }"
					@click="up(path.length - i)"
				>{{ n.name }}</li>
				<div class="ml-auto subtotal">{{ $util.groupNums(node.value) }}</div>
			</ol>
		</nav>

		<div
			class="d-flex border-top border-bottom vis"
			ref="vis"
			@mouseout="hovered=-1"
		>
			<div class="d-flex left-column">
				<div
					class="back-bar d-flex justify-content-center"
					v-if="path.length > 0"
					@click="up();autoScroll()"
					:style="{ backgroundColor: bgColor(node,-1), color: fgColor(node,-1) }"
				>
					<i class="fas fa-fw fa-level-up-alt mx-2 my-auto"></i>
				</div>
				<div class="d-flex flex-column flex-grow-1">
					<div
						class="bar"
						v-for="(n,i) in children"
						:key="n.id"
						:data-id="n.id"
						:data-index="i"
						:style="{ backgroundColor: bgColor(n,i), color: fgColor(n,i), flexGrow: n.value }"
						@click="down(n, i);autoScroll()"
						@mouseover="hovered=i"
						data-toggle="tooltip"
						data-placement="left"
						:title="tooltips[n.id]"
						oncontextmenu="return false;"
					>
						<div class="text-right w-100">
							<span class="d-inline d-sm-none font-weight-bold">{{ $util.groupNums(n.value, true) }}</span>
							<span class="d-none d-sm-inline">{{ $util.groupNums(n.value) }}</span>
							<span class="d-none d-md-inline ml-1">({{ Math.round(n.value/node.value*100) }}%)</span>
							<span class="d-sm-none"><br>{{ n.name }}</span>
							<i
								class="fas fa-fw fa-level-down-alt ml-1"
								v-if="n.children && n.children.length"
							></i>
						</div>
						<div class="d-flex d-sm-none">
							<div
								class="btn btn-link bg-light milestone-button ml-3 mr-1 px-2"
								@click="$eventBus.$emit('ms', milestoneId(n))"
								v-if="$config.modules.milestones && milestoneId(n)"
							><i class="fas fa-fw fa-camera"></i></div>
							<div
								class="btn btn-link ml-3 mr-1 px-2"
								:style="{ color: fgColor(n,i) }"
								v-else-if="tooltips[n.id]"
							>
								<sub class="fas fa-fw fa-info"></sub>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="d-none d-sm-block middle-column curves">
				<svg
					height="100%"
					width="100%"
				>
					<path
						class="curve"
						v-for="(n,i) in children"
						:d="curves[i]"
						:key="n.id"
						:style="{ stroke: bgColor(n,i) }"
						vector-effect="non-scaling-stroke"
					></path>
				</svg>
			</div>
			<div class="d-none d-sm-flex flex-column justify-content-around right-column text-left">
				<div
					class="label"
					v-for="(n,i) in children"
					:class="{ 'text-muted': hovered > -1 && i != hovered }"
					:data-id="n.id"
					:data-index="i"
					:key="n.id"
					@mouseover="hovered=i"
					oncontextmenu="return false;"
				>
					<span @click="down(n, i);autoScroll()">{{ n.name }}</span>
					<span
						class="btn btn-link milestone-button ml-auto"
						@click="$eventBus.$emit('ms', milestoneId(n))"
						v-if="$config.modules.milestones && milestoneId(n)"
					><i class="fas fa-camera"></i></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import tinycolor from "tinycolor2";

export default {
	props: ["defaultMode", "year", "side"], // side is "expense" or "income"
	data() {
		return {
			curves: [],
			hovered: -1,
			loading: true,
			mode: 0, // 0 = econ, 1 = func
			path: [],
			resizeTimeout: null,
		};
	},
	computed: {
		children: function () {
			try {
				return this.node.children
					.filter(function (node) {
						return !String(node.id).startsWith("F");
					})
					.sort(function (a, b) {
						return b.value - a.value;
					});
			} catch (e) {
				return [];
			}
		},
		data() {
			return this.$d[this.year][this.side];
		},
		node: function () {
			return this.nodePath[this.nodePath.length - 1];
		},
		nodePath: function () {
			var r = this.root;
			var np = [r];
			for (var p = 0; p < this.path.length; p++) {
				var id = this.path[p];
				var c = r.children.filter((n) => n.id == id)[0];
				if (c && c.children.length > 0) {
					r = c;
					np.push(r);
				} else {
					break;
				}
			}
			return np;
		},
		root: function () {
			return (
				(this.mode % 2 == 0 ? this.data.econ : this.data.func) || {
					name: "",
					value: 0,
					children: [],
				}
			);
		},
		tooltips() {
			return this.$tooltips[this.year] || {};
		},
		type: function () {
			return this.mode % 2 == 0 ? "econ" : "func";
		},
	},
	watch: {
		node: function () {
			$(".nav-pills .nav-link").blur();
			this.$nextTick(function () {
				this.updateCurves();
			});
		},
		year: function (y) {
			if (!this.data.func && this.mode != 0) {
				this.mode = 0;
				this.path = [];
			}
		},
	},
	methods: {
		autoScroll: function () {
			document.querySelector('.tooltip')?.remove();
			$("html, body").animate({ scrollTop: $(this.$el).offset().top - 75 });
		},
		bgColor: function (node, index) {
			const id = this.nodePath.length > 1 ? this.nodePath[1].id : node.id;

			const defaultColor = "#6c757d";
			const colors = this.$config.color || {};
			const color = tinycolor(colors[id] || defaultColor);
			if (this.nodePath.length > 1) {
				const opacity = 0.5 + 0.5 * (node.value / this.nodePath[1].value);
				color.setAlpha(opacity);
			}
			if (this.hovered > -1 && index != this.hovered && index > -1) {
				color.setAlpha(color.getAlpha() * 0.5);
			}
			return color.toRgbString();
		},
		fgColor: function (node, index) {
			var color = tinycolor(this.bgColor(node, index));
			return color.isLight() || color.getAlpha() < 0.5 ? "black" : "white";
		},
		curve(index) {
			try {
				var bars = this.$refs.vis;
				var barsTop = $(bars).offset().top;

				var bar = $(`.bar[data-index=${index}]`, bars);
				var barHeight = $(bar).outerHeight();
				var barTop = $(bar).offset().top - barsTop;
				var barMiddle = barTop + barHeight / 2;

				var label = $(`.label[data-index=${index}]`, bars);
				var labelHeight = $(label).outerHeight();
				var labelTop = $(label).offset().top - barsTop;
				var labelMiddle = labelTop + labelHeight / 2;

				var svg = $(".curves svg", bars);
				var svgWidth = $(svg).outerWidth();

				var x1 = 0;
				var y1 = barMiddle;
				var x2 = svgWidth;
				var y2 = labelMiddle; //self.labelY(node, index).slice(0, -1);
				var cx1 = svgWidth * 0.2;
				var cx2 = svgWidth * 0.8;
				var m = x1 + "," + y1;
				var c1 = cx1 + "," + y1;
				var c2 = cx2 + "," + y2;
				var e = x2 + "," + y2;
				return ["M" + m, "C" + c1, c2, e].join(" ");
			} catch (e) {
				return "";
			}
		},
		down: function (node, index) {
			$(".tooltip").remove();
			if (node.children && node.children.length > 0) {
				this.path.push(node.id);
			}
		},
		up: function (n) {
			n = Math.max(n || 1, 0);
			while (n > 0) {
				this.path.pop();
				n--;
			}
		},
		updateCurves: function () {
			var svg = $(".curves svg", this.$refs.vis);
			var svgHeight = $(svg).outerHeight();
			var svgWidth = $(svg).outerWidth();
			$(svg).attr("viewBox", [0, 0, svgWidth, svgHeight].join(" "));

			var self = this;
			this.curves = this.children.map(function (n, i) {
				return self.curve(i);
			});
		},
		regenerateTooltips() {
			$('[data-toggle="tooltip"]').tooltip();
		},
		milestoneId: function (node) {
			try {
				const mid = this.$milestones.rels[this.year][node.id];
				return mid ? mid : null;
			} catch (e) {
				return null;
			}
		},
	},
	mounted: function () {
		if (this.data.func && this.defaultMode == 1) this.mode = 1;

		this.regenerateTooltips();
		const self = this;
		self.updateCurves();
		window.addEventListener("resize", function () {
			clearTimeout(self.resizeTimeout);
			self.resizeTimeout = setTimeout(function () {
				self.updateCurves();
			}, 100);
		});

		self.$eventBus.$on("jump", (target) => {
			console.log("ON jump", target);
			if (target.side == self.side) {
				self.mode = target.type == "econ" ? 0 : 1;
				self.path = [];
				(target.path || []).forEach((id) => {
					for (let i = 0; i < self.children.length; i++) {
						const node = self.children[i];
						if (node.id == id && node.children && node.children.length > 0) {
							self.path.push(id);
						}
					}
				});
				self.$nextTick(() => self.autoScroll());
			}
		});
	},
	updated: function () {
		this.regenerateTooltips();
	},
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.visualization {
	font-family: $vis-font-family;

	.left-column {
		width: 35%;

		@include media-breakpoint-down(xs) {
			width: 100%;
		}
	}
	.middle-column {
		width: 5%;
	}
	.right-column {
		width: 60%;
	}

	@include media-breakpoint-up(md) {
		.left-column {
			width: 45%;
		}
		.middle-column {
			width: 10%;
		}
		.right-column {
			width: 45%;
		}
	}

	.bar,
	.label {
		align-items: center;
		display: flex;
		margin-bottom: 1px;
		min-height: 64px; // iOS fix
		padding: 0.25rem 0.25rem;
		@include media-breakpoint-up(sm) {
			min-height: 24px;
			padding: 0.1rem;
		}
		@include media-breakpoint-up(md) {
			padding: 0.1rem 0.5rem;
		}
		user-select: none;
	}

	.back-bar {
		cursor: pointer;
		margin-right: 1px;

		&:hover {
			opacity: 0.8;
		}
	}

	.breadcrumb-item {
		text-align: left;
	}

	.breadcrumb-item.active,
	.breadcrumb .subtotal {
		color: $dark;
		font-weight: bold;
	}

	.breadcrumb-item:not(.active) {
		&:not(:hover) {
			color: $text-muted;
		}
		cursor: pointer;
	}

	.curve {
		fill: none;
	}

	.label {
		text-align: left;
	}

	svg {
		height: 100%;
		width: 100%;
	}

	.vis-header {
		font-weight: bold;
	}

	.vis {
		@include media-breakpoint-up(sm) {
			height: 75vh;
			min-height: 400px;
		}
		font-size: 90%;

		& > div {
			height: 100%;
		}

		.bar,
		.label span {
			cursor: pointer;
		}
	}
}
</style>

