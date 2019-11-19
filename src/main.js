import VueMarkdown from 'vue-markdown'

import DefaultLayout from '~/layouts/Default';
import NavBar from '~/components/NavBar';
import SearchModal from '~/components/SearchModal';
import SearchModalContent from '~/components/SearchModalContent';
import MastHead from '~/components/MastHead';
import Welcome from '~/components/Welcome';
import Inex from '~/components/Inex.vue';
import Visualization from '~/components/Visualization';
import VisualizationSection from '~/components/VisualizationSection';
import Milestone from '~/components/Milestone';
import MilestoneModalContent from '~/components/MilestoneModalContent';
import MilestoneSection from '~/components/MilestoneSection';
import FeedbackSection from '~/components/FeedbackSection';
import Footer from '~/components/Footer';
import Social from '~/components/Social';
import FeedbackModal from '~/components/FeedbackModal';
import MoreInfoModal from '~/components/MoreInfoModal';

import config from '~/data/config.js';
import data from '~/data/data.json';
import eventBus from '~/event-bus.js';
import functions from '~/data/functions.json';
import milestones from '~/data/milestones.json';
import tags from '~/data/tags.json';
import tooltips from '~/data/tooltips.json';

export default function (Vue, { router, head, isClient }) {
	Vue.component('VueMarkdown', VueMarkdown);
	Vue.component('Layout', DefaultLayout);
	Vue.component('NavBar', NavBar);
	Vue.component('SearchModal', SearchModal);
	Vue.component('SearchModalContent', SearchModalContent);
	Vue.component('MastHead', MastHead);
	Vue.component('Welcome', Welcome);
	Vue.component('Inex', Inex);
	Vue.component('Visualization', Visualization);
	Vue.component('VisualizationSection', VisualizationSection);
	Vue.component('Milestone', Milestone);
	Vue.component('MilestoneModalContent', MilestoneModalContent);
	Vue.component('MilestoneSection', MilestoneSection);
	Vue.component('FeedbackSection', FeedbackSection);
	Vue.component('Footer', Footer);
	Vue.component('Social', Social);
	Vue.component('FeedbackModal', FeedbackModal);
	Vue.component('MoreInfoModal', MoreInfoModal);

	Vue.prototype.$config = config;
	Vue.prototype.$d = data;
	Vue.prototype.$eventBus = eventBus;
	Vue.prototype.$functions = functions;
	Vue.prototype.$milestones = milestones;
	Vue.prototype.$tags = tags;
	Vue.prototype.$tooltips = tooltips;
	Vue.prototype.$util = {
		groupNums(v, ns) {
			var s = ['', 'e', 'M', 'Mrd'];
			var i = 0;
			v = Number(v);
			var neg = v < 0;
			v = Math.abs(v);
			while (ns && i < s.length && v > 1000) {
				v /= 1000;
				i++;
			}
			v = Math.round(v * 100) / 100;
			var vs = (v + '').replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) { return $0 + ' ' });
			return (neg ? '-' : '') + (vs + ' ' + s[i] + ' Ft').trim();
		}
	};

	// disabling modules if there's no data
	if (milestones.length == 0) {
		config.modules.milestones = false;
	}
	Object.keys(data).forEach(year => {
		if (!data[year].income) {
			config.modules.income = false;
		}
	});
	if (!config.modules.income) {
		config.modules.inex = false;
	}
}
