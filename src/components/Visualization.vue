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
						 class="nav-link"
						 href="javascript:void(0)"
						 data-toggle="tooltip"
						 data-placement="bottom"
						 title="Működési vagy felhalmozási jellegük alapján mutatja meg a kiadások összetételét, hogy mekkora a személyi kiadások, a kapcsolódó munkáltatói járulékok, a dologi kiadások, a beruházási és felújítási kiadások, az államháztartáson belüli és kívüli támogatások, transzferek összege a költségvetésben."
						 :class="{ active: mode == 0 }"
						 @click="path = []; mode = 0"
						>
							Közgazdasági nézet
						</a>
					</li>
					<li class="nav-item">
						<a
						 class="nav-link"
						 href="javascript:void(0)"
						 data-toggle="tooltip"
						 data-placement="bottom"
						 title="A költségvetési kiadásokat osztályozza, azok társadalmi-gazdasági cél szerinti összetételét mutatja. Az általános közszolgáltatásoktól a védelmi kiadásokig összesen 10 kategóriában tartalmazza a kerület működésének területeit."
						 :class="{ active: mode == 1 }"
						 @click="path = []; mode = 1"
						>
							Funkcionális nézet
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
	</div>
</template>

<script>
import data from "~/data/data.json";

export default {
	props: ["id", "year", "side"], // side is "expense" or "income"
	data() {
		return {
			curves: [],
			hovered: -1,
			loading: true,
			mode: 0,
			path: []
		};
	},
	computed: {
		children: function() {
			try {
				return this.node.children.sort(function(a, b) {
					return b.value - a.value;
				});
			} catch (e) {
				return [];
			}
		},
		data() {
			return data[this.year][this.side];
		},
		node: function() {
			return this.nodePath[this.nodePath.length - 1];
		},
		nodePath: function() {
			var r = this.root || new Node("", 0, []);
			var np = [r];
			for (var p = 0; p < this.path.length; p++) {
				var i = this.path[p];
				if (r.children[i] && r.children[i].children.length > 0) {
					r = r.children[i];
					np.push(r);
				} else {
					break;
				}
			}
			return np;
		},
		root: function() {
			return this.mode % 2 == 0 ? this.data.econ : this.data.func;
		}
	},
	watch: {
		node: function() {
			$(".nav-pills .nav-link").blur();
			this.$nextTick(function() {
				this.updateCurves();
			});
		}
	},
	methods: {
		bgColor: function(node, index) {
			var colors = [
				"#f7981d" /* 01 Általános közszolgáltatások */,
				"#5c628f" /* 02 Védelem */,
				"#ee2a7b" /* 03 Közrend és közbiztonság */,
				"#254478" /* 04 Gazdasági ügyek */,
				"#d32027" /* 05 Környezetvédelem */,
				"#5c9ad2" /* 06 Lakásépítés és kommunális létesítménye */,
				"#e5960a" /* 07 Egészségügy */,
				"#70ac45" /* 08 Szabadidő, sport, kultúra, vallás */,
				"#4971b6" /* 09 Oktatás */,
				"#bb208a" /* 10 Szociális védelem */,
				"#ef538c" /* 9000 Technikai funkciókódok */
			];

			var color = colors[this.colorIndex(node)];
			if (this.path.length > 0) {
				var opacity = node.value / this.node.children[0].value;
				opacity = 0.5 + opacity * 0.5;

				color = tinycolor(color);
				color.setAlpha(opacity);
				color = color.toRgbString();
			}
			if (this.hovered > -1 && index != this.hovered && index > -1) {
				color = tinycolor(color);
				color.setAlpha(color.getAlpha() * 0.5);
				color = color.toRgbString();
			}
			return color;
		},
		fgColor: function(node, index) {
			var color = tinycolor(this.bgColor(node, index));
			return color.isLight() || color.getAlpha() < 0.5 ? "black" : "white";
		},
		colorIndex: function(node) {
			var id = node.id;
			if (this.path.length > 0) {
				id = this.root.children[this.path[0]].id;
			}
			var ids = this.root.children
				.map(function(c) {
					return c.id;
				})
				.sort(function(a, b) {
					return Number(a) - Number(b);
				});
			return ids.indexOf(id);
		},
		curve(id, node, index) {
			try {
				var bars = $("#" + id);
				var barsTop = $(bars).offset().top;

				var bar = $("#" + id + " .bar[data-index=" + index + "]");
				var barHeight = $(bar).outerHeight();
				var barTop = $(bar).offset().top - barsTop;
				var barMiddle = barTop + barHeight / 2;

				var label = $("#" + id + " .label[data-index=" + index + "]");
				var labelHeight = $(label).outerHeight();
				var labelTop = $(label).offset().top - barsTop;
				var labelMiddle = labelTop + labelHeight / 2;

				var svg = $("#" + id + " .curves svg");
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
		down: function(index) {
			$(".tooltip").remove();
			if (
				this.children[index].children &&
				this.children[index].children.length > 0
			) {
				this.path.push(index);
			}
		},
		up: function(n) {
			n = Math.max(n || 1, 0);
			while (n > 0) {
				this.path.pop();
				n--;
			}
		},
		updateCurves: function() {
			var svg = $("#" + this.id + " .curves svg");
			var svgHeight = $(svg).outerHeight();
			var svgWidth = $(svg).outerWidth();
			$(svg).attr("viewBox", [0, 0, svgWidth, svgHeight].join(" "));

			var self = this;
			this.curves = this.children.map(function(n, i) {
				return self.curve(self.id, n, i);
			});
		},
		regenerateTooltips() {
			$('[data-toggle="tooltip"]').tooltip();
		}
	},
	mounted: function() {
		this.regenerateTooltips();
		var self = this;
		window.addEventListener("resize", function() {
			self.updateCurves();
		});
	},
	updated: function() {
		this.regenerateTooltips();
	}
};
</script>

<style lang="scss">
@import "../scss/variables";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.visualization {
	.left-column,
	.right-column {
		width: 45%;
	}

	.middle-column {
		width: 10%;
	}

	.bar,
	.label {
		align-items: center;
		display: flex;
		flex: 1;
		margin-bottom: 1px;
		padding: 0.1rem 0.5rem;
	}

	.back-bar {
		cursor: pointer;
		margin-right: 1px;

		&:hover {
			opacity: 0.8;
		}
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
		height: 50vh;
		font-size: 90%;
		min-height: 400px;

		& > div {
			height: 100%;
		}

		.bar,
		.label {
			cursor: pointer;
		}
	}
}
</style>

