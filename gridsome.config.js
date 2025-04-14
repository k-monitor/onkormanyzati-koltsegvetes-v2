const config = require('./src/data/config.json');

const gtm = !config.gtm || !config.gtm.id ? [] : [{
	use: 'gridsome-plugin-gtm',
	options: {
		id: config.gtm.id,
		enabled: true,
		debug: true
	}
}]

module.exports = {
	plugins: [
		...gtm
	],
	siteName: config.seo.siteName
}
