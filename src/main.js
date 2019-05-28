import DefaultLayout from '~/layouts/Default.vue';
import NavBar from '~/components/NavBar.vue';
import MastHead from '~/components/MastHead.vue';
import Footer from '~/components/Footer.vue';

import config from '~/data/config.json';

export default function (Vue, { router, head, isClient }) {
	Vue.component('Layout', DefaultLayout);
	Vue.component('NavBar', NavBar);
	Vue.component('MastHead', MastHead);
	Vue.component('Footer', Footer);
	Vue.prototype.$config = config;
}
