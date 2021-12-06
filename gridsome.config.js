const config = require('./src/data/config.json');

const ga = !config.ga || !config.ga.id ? [] : [{
	use: '@gridsome/plugin-google-analytics',
	options: {
		id: config.ga.id
	}
}]

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
		...ga,
		...gtm
	],
	siteName: config.seo.siteName
}
