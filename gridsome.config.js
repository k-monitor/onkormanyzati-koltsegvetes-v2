const config = require('./src/data/config.json');

function ga() {
	if (config.ga && config.ga.id) {
		return [{
			use: '@gridsome/plugin-google-analytics',
			options: {
				id: config.ga.id
			}
		}]
	}
	return []
}
console.log(JSON.stringify(ga()));
module.exports = {
	plugins: [
		...ga(),
	],
	siteName: config.seo.siteName
}
