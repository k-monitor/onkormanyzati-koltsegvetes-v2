$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

Vue.component('vis', {
	template: '#vis-template',
	props: ['id', 'e', 'f'],
	data: function () {
		return {
			curves: [],
			economicTree: null,
			functionalTree: null,
			hovered: -1,
			loading: true,
			mode: null,
			path: []
		};
	},
	computed: {
		root: function () {
			return this.mode % 2 == 0 ? this.economicTree : this.functionalTree;
		},
		node: function () {
			var r = this.root || new Node('', 0, []);
			for (var p = 0; p < this.path.length; p++) {
				var i = this.path[p];
				if (r.children[i] && r.children[i].children.length > 0) {
					r = r.children[i];
				} else {
					break;
				}
			}
			return r;
		},
		children: function () {
			try {
				return this.node.children.sort(function (a, b) {
					return b.value - a.value;
				});
			} catch (e) {
				return [];
			}
		}
	},
	watch: {
		node: function () {
			$('.nav-pills .nav-link').blur();
			this.$nextTick(function () {
				this.updateCurves();
			});
		}
	},
	methods: {
		bgColor: function (node, index) {
			var colors = [
				'#f7981d' /* 01 Általános közszolgáltatások */,
				'#5c628f' /* 02 Védelem */,
				'#ee2a7b' /* 03 Közrend és közbiztonság */,
				'#254478' /* 04 Gazdasági ügyek */,
				'#d32027' /* 05 Környezetvédelem */,
				'#5c9ad2' /* 06 Lakásépítés és kommunális létesítménye */,
				'#e5960a' /* 07 Egészségügy */,
				'#70ac45' /* 08 Szabadidő, sport, kultúra, vallás */,
				'#4971b6' /* 09 Oktatás */,
				'#bb208a' /* 10 Szociális védelem */,
				'#ef538c' /* 9000 Technikai funkciókódok */,
			];

			var color = colors[this.colorIndex(node, index)];
			if (this.path.length > 0) {
				var opacity = node.value / this.node.children[0].value;
				opacity = 0.5 + opacity * 0.5;

				color = tinycolor(color);
				color.setAlpha(opacity);
				color = color.toRgbString();
			}
			if (this.hovered > -1 && index != this.hovered) {
				color = tinycolor(color);
				color.setAlpha(color.getAlpha() * 0.5);
				color = color.toRgbString();
			}
			return color;
		},
		fgColor: function (node, index) {
			var color = tinycolor(this.bgColor(node, index));
			return color.isLight() || color.getAlpha() < 0.5 ? 'black' : 'white';
		},
		colorIndex: function (node, index) {
			var id = node.id;
			if (this.path.length > 0) {
				id = this.root.children[this.path[0]].id;
			}
			var ids = this.root.children
				.map(function (c) { return c.id; })
				.sort(function (a, b) { return Number(a) - Number(b); });
			return ids.indexOf(id);
		},
		down: function (index) {
			if (this.children[index].children && this.children[index].children.length > 0) {
				this.path.push(index);
			}
		},
		up: function () {
			this.path.splice(-1, 1);
		},
		updateCurves: function () {
			var svg = $('#' + this.id + ' .curves svg');
			var svgHeight = $(svg).outerHeight();
			var svgWidth = $(svg).outerWidth();
			$(svg).attr('viewBox', [0, 0, svgWidth, svgHeight].join(' '));

			var self = this;
			this.curves = this.children.map(function (n, i) {
				return curve(self.id, n, i);
			});
		}
	},
	mounted: function () {
		var self = this;
		$.when(
			$.get(self.e),
			$.get(self.f),
		).then(function (e, f) {
			// TODO still not checks whether files are missing (regardless of given URL)
			self.economicTree = self.e ? e[0] : null;
			self.functionalTree = self.f ? f[0] : null;
			self.mode = self.f ? 1 : 0;
			self.loading = !self.e && !self.f;
			window.addEventListener('resize', function () {
				self.updateCurves();
			});
		}).fail(function (f1) {
			console.log('ERR', f1);
		});
	},
	updated: function () {
		$('[data-toggle="tooltip"]').tooltip();
	}
});

var visualization = new Vue({
	el: '#visualization',
	data: {
	}
});

function Node(name, value, children) {
	var self = this;

	self.name = name ? name : '<anon>';
	self.value = value ? value : 0;
	self.children = children || [];

	self.update = function () {
		if (self.children && self.children.length > 0) {
			self.value = 0;
			self.children.forEach(function (child) {
				child.update();
				self.value += child.value;
			});
			self.children = children.sort(function (a, b) { return b.value - a.value; });
		}
	};

	self.update();
} // node

function curve(id, node, index) {
	try {
		var bars = $('#' + id);
		var barsTop = $(bars).offset().top;

		var bar = $('#' + id + ' .bar[data-index=' + index + ']');
		var barHeight = $(bar).outerHeight();
		var barTop = $(bar).offset().top - barsTop;
		var barMiddle = barTop + barHeight / 2;

		var label = $('#' + id + ' .label[data-index=' + index + ']');
		var labelHeight = $(label).outerHeight();
		var labelTop = $(label).offset().top - barsTop;
		var labelMiddle = labelTop + labelHeight / 2;

		var svg = $('#' + id + ' .curves svg');
		var svgWidth = $(svg).outerWidth();

		var x1 = 0;
		var y1 = barMiddle;
		var x2 = svgWidth;
		var y2 = labelMiddle;//self.labelY(node, index).slice(0, -1);
		var cx1 = svgWidth * 0.2;
		var cx2 = svgWidth * 0.8;
		var m = x1 + ',' + y1;
		var c1 = cx1 + ',' + y1;
		var c2 = cx2 + ',' + y2;
		var e = x2 + ',' + y2;
		return ['M' + m, 'C' + c1, c2, e].join(' ');
	} catch (e) {
		return '';
	}
}
