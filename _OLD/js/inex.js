Vue.component('inex', {
	template: '#inex-template',
	props: ['in', 'ex', 'tt'],
	data: function () {
		return {
			expenseTree: null,
			incomeTree: null,
			loading: true,
			tooltips: {}
		};
	},
	computed: {
		expenseChildren: function () {
			return this.expenseTree.children.sort(function (a, b) {
				return a.altId.localeCompare(b.altId);
			}).filter(function (n) {
				return n.name.indexOf('Finanszírozási') == -1;
			});
		},
		expenseCorrection: function () {
			return Math.max(0, this.incomeSum - this.expenseSum);
		},
		expenseSum: function () {
			return this.expenseChildren.map(function (node) {
				return node.value;
			}).reduce(function (sum, value) {
				return sum + value;
			});
		},
		incomeChildren: function () {
			return this.incomeTree.children.sort(function (a, b) {
				return a.altId.localeCompare(b.altId);
			}).filter(function (n) {
				return n.name.indexOf('Finanszírozási') == -1;
			});
		},
		incomeCorrection: function () {
			return Math.max(0, this.expenseSum - this.incomeSum);
		},
		incomeSum: function () {
			return this.incomeChildren.map(function (node) {
				return node.value;
			}).reduce(function (sum, value) {
				return sum + value;
			});
		},
	},
	methods: {
		bgColor: function (tree, node, color) {//darkseagreen, indianred
			var max = tree.children.map(function (n) { return n.value }).reduce(function (m, v) { return Math.max(m, v); });
			var alpha = node.value / max * 0.75 + 0.25;
			return tinycolor(color).setAlpha(alpha).toRgbString();
		},
		fgColor: function (tree, node, color) {
			var color = tinycolor(this.bgColor(tree, node, color));
			return color.isLight() || color.getAlpha() < 0.5 ? 'black' : 'white';
		}
	},
	mounted: function () {
		var self = this;
		$.when(
			$.get(self.ex),
			$.get(self.in),
			$.get(self.tt)
		).then(function (e, i, t) {
			self.expenseTree = e[0];
			self.incomeTree = i[0];
			(t[0] || '').trim().split('\n').forEach(function (row) {
				var parts = row.split('\t');
				self.tooltips[parts[0]] = parts[1];
			});
			self.loading = false;
			$('[data-toggle="tooltip"]').tooltip();
		}).fail(function (f1) {
			console.log('ERR', f1);
		});
	}
});

var inex = new Vue({
	el: '#inex'
});