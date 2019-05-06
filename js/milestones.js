Vue.component('milestone-card', {
	template: '#milestone-card-template',
	props: ['milestone']
});

var milestones = new Vue({
	el: '#milestones',
	data: {
		milestones: []
	},
	mounted: function () {
		var self = this;
		$.get('data/milestones.csv', function (data) {
			self.milestones = Papa.parse(data.trim(), {
				delimiter: '\t',
				header: true
			}).data;
		});
	}
});