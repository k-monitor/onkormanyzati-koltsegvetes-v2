<template>

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
				return curve(self.id, n, i);
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
