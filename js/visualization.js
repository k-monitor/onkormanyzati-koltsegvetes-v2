var ECON = {};
var FUNC = {};

var visualization = new Vue({
	el: '#visualization',
	data: {
		roots: [ECON, FUNC],
		loading: true,
		mode: 1,
		path: []
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
			return this.node.children.filter(function (n) {
				return n.value > 0;
			}).sort(function (a, b) {
				return b.value - a.value;
			});
		}
	},
	methods: {
		down: function (index) {
			if (this.children[index].children.length > 0) {
				this.path.push(index);
				console.log('DOWN', index, this.path);
			}
		},
		up: function () {
			visualization.path.splice(-1, 1);
		}
	},
	mounted: function () {
		var self = this;
		$.when(
			$.get('data/budget.csv'),
			$.get('data/economies.csv'),
			$.get('data/functions.csv')
		).then(function (b, e, f) {
			loadFlatTree(b[0]);
			loadTreeData(e[0], ECON);
			loadTreeData(f[0], FUNC);

			ECON = new Node('ECON', 0, Object.values(ECON));
			FUNC = new Node('FUNC', 0, Object.values(FUNC));

			self.roots = [ECON, FUNC];
			//ECON.forEach(function(e) { e.update(); });
			//FUNC.forEach(function(e) { e.update(); });

			//generateColors();

			self.loading = false;
		}).fail(function (f1) {
			console.log('ERR', f1);
		});
	}
});

function Category(id, name) {
	var self = this;
	self.id = id;
	self.name = name;
}

function Node(name, value, children) {
	var self = this;

	self.name = name ? name : '<anon>';
	self.value = value ? value : 0;
	self.children = children ? children.sort(function (a, b) { return b.value - a.value; }) : [];

	self.update = function () {
		if (self.children && self.children.length > 0) {
			self.children = children.sort(function (a, b) { return b.value - a.value; });
			self.value = 0;
			self.children.forEach(function (child) {
				child.update();
				self.value += child.value;
			});
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

	$.each(budget, function (k, v) {
		addOrInc(ECON, v.econ_id, Number(v.value));
		addOrInc(FUNC, v.func_id, Number(v.value));
	});

	mapToNode(ECON);
	mapToNode(FUNC);
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
