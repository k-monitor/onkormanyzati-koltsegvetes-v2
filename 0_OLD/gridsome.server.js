const fs = require('fs');
const slugify = require('slugify');
require('./scripts/prepare');

const config = JSON.parse(fs.readFileSync('src/data/config.json', { encoding: 'utf8' }));
const { iframe } = config;

module.exports = function (api) {
	api.createPages(({ createPage }) => {
		const routeName = slugify(iframe.title).toLowerCase();
		if (!routeName) return;
		createPage({
			path: '/' + routeName,
			route: {
				name: routeName,
			},
			component: './src/components/IframePage.vue'
		});
	});
}
