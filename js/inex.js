Vue.component('inex', {
	template: '#inex-template',
	props: ['in', 'ex'],
	data: function () {
		return {
			expenseTree: null,
			incomeTree: null,
			loading: true
		};
	},
	computed: {
		expenseChildren: function() {
			return this.expenseTree.children.sort(function (a, b) {
				return b.value - a.value;
			});
		},
		incomeChildren: function() {
			return this.incomeTree.children.sort(function (a, b) {
				return b.value - a.value;
			});
		}
	},
	mounted: function () {
		var self = this;
		$.when(
			$.get(self.ex),
			$.get(self.in)
		).then(function (e,i) {
			self.expenseTree = e[0];
			self.incomeTree = i[0];
			self.loading = false;
		}).fail(function (f1) {
			console.log('ERR', f1);
		});
	}
});

var inex = new Vue({
	el: '#inex'
});