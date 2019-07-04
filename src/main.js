import DefaultLayout from '~/layouts/Default.vue';
import NavBar from '~/components/NavBar.vue';
import MastHead from '~/components/MastHead.vue';
import Welcome from '~/components/Welcome.vue';
import Inex from '~/components/Inex.vue';
import Visualization from '~/components/Visualization';
import VisualizationSection from '~/components/VisualizationSection';
import Footer from '~/components/Footer.vue';

import config from '~/data/config.js';
import tooltips from '~/data/tooltips.json';

export default function (Vue, { router, head, isClient }) {
	Vue.component('Layout', DefaultLayout);
	Vue.component('NavBar', NavBar);
	Vue.component('MastHead', MastHead);
	Vue.component('Welcome', Welcome);
	Vue.component('Inex', Inex);
	Vue.component('Visualization', Visualization);
	Vue.component('VisualizationSection', VisualizationSection);
	Vue.component('Footer', Footer);

	Vue.prototype.$config = config;
	Vue.prototype.$tooltips = tooltips;
	Vue.prototype.$util = {
		groupNums(v, ns) {
			var s = ['', 'e', 'M', 'Mrd'];
			var i = 0;
			v = Number(v);
			while (ns && i < s.length && v > 1000) {
				v /= 1000;
				i++;
			}
			v = Math.round(v);
			var vs = (v + '').replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) { return $0 + ' ' });
			return (vs + ' ' + s[i] + ' Ft').trim();
		}
	};
}
