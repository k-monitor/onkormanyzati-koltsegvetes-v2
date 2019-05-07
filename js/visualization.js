$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

var visualization = new Vue({
	el: '#visualization',
	data: {
		curves: [],
		hovered: -1,
		loading: true,
		mode: 1,
		path: [],
		roots: [],
	},
	computed: {
		root: function () {
			return this.roots[this.mode % 2];
		},
		node: function () {
			var r = this.root;
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
				return this.node.children.filter(function (n) {
					return n.value > 0;
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
			if (this.children[index].children.length > 0) {
				this.path.push(index);
			}
		},
		up: function () {
			visualization.path.splice(-1, 1);
		},
		updateCurves: function () {
			var svg = $('#curves svg');
			var svgHeight = $(svg).outerHeight();
			var svgWidth = $(svg).outerWidth();
			$(svg).attr('viewBox', [0, 0, svgWidth, svgHeight].join(' '));

			this.curves = this.children.map(function (n, i) {
				return curve(n, i);
			});
		}
	},
	mounted: function () {
		var self = this;
		$.when(
			$.get('data/budget.csv'),
			$.get('data/economies.csv'),
			$.get('data/functions.csv')
		).then(function (b, e, f) {
			var b = loadFlatTree(b[0]);
			loadTreeData(e[0], b.econ);
			loadTreeData(f[0], b.func);
			self.roots = [
				new Node('Teljes költségvetés', 0, Object.values(b.econ)),
				new Node('Teljes költségvetés', 0, Object.values(b.func))
			];

			//generateColors();

			self.loading = false;
		}).fail(function (f1) {
			console.log('ERR', f1);
		});
	}
});
window.onresize = function () {
	visualization.updateCurves();
}

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

function loadFlatTree(csv) {
	/*
		CSV structure:
		line 0: ECON ID
		line 1: ECON TITLE
		col 0: FUNC ID
		col 0: FUNC TITLE
		cell i>1, j>1: VALUE
	*/

	// read CSV
	var data = Papa.parse(csv, {
		dynamicTyping: true,
		header: false, // let's handle manually this time
		skipEmptyLines: true
	}).data;

	// convert to JSON
	var econ = data[0], budget = [];
	for (var y = 0; y < data.length; y++) {
		var func = data[y][0];
		for (var x = 2; x < data[y].length; x++) {
			if (2 <= y) {
				budget.push({
					econ_id: econ[x],
					func_id: func,
					value: Number((data[y][x] || '').toString().replace(/\D+/g, ''))
				});
			}
		}
	}

	var econ = {};
	var func = {};
	$.each(budget, function (k, v) {
		addOrInc(econ, v.econ_id, Number(v.value));
		addOrInc(func, v.func_id, Number(v.value));
	});

	mapToNode(econ);
	mapToNode(func);

	return { econ: econ, func: func };
}

function loadTreeData(csv, TREE) { // data is CSV: id, value, parent_id

	// 0. parsing CSV
	var data = Papa.parse(csv, {
		dynamicTyping: true,
		header: true,
		skipEmptyLines: true,
		trimHeader: true
	}).data;

	// 1. updating nodes with label and parent_id
	$.each(data, function (k, v) {
		if (!TREE[v.id]) TREE[v.id] = new Node('', 0, []);
		TREE[v.id].name = v.value.trim();
		TREE[v.id]['parent_id'] = v.parent_id;
		TREE[v.id]['id'] = v.id;
	});

	// 2. building up children arrays
	$.each(TREE, function (k, v) {
		if (TREE[v.parent_id]) {
			TREE[v.parent_id].children.push(v);
			TREE[v.parent_id].update();
		} else {
			v.parent_id = null;
		}
	});

	// 3. remove non-root elements
	$.each(TREE, function (k, v) {
		if (null != v.parent_id) delete TREE[k];
	});
}

function addOrInc(object, key, value) {
	if (!object[key]) object[key] = 0;
	object[key] += value;
}

function mapToNode(object) {
	Object.keys(object).map(function (k) {
		object[k] = new Node('', object[k], []);
	});
}

function groupNums(v) {
	return (v + '').replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) { return $0 + ' ' });
}

function curve(node, index) {
	try {
		var bars = $('#vis');
		var barsHeight = bars.outerHeight();
		var barsTop = $(bars).offset().top;

		var bar = $('.bar[data-index=' + index + ']');
		var barHeight = $(bar).outerHeight();
		var barTop = $(bar).offset().top - barsTop;
		var barMiddle = barTop + barHeight / 2;

		var label = $('.label[data-index=' + index + ']');
		var labelHeight = $(label).outerHeight();
		var labelTop = $(label).offset().top - barsTop;
		var labelMiddle = labelTop + labelHeight / 2;

		var svg = $('#curves svg');
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
