module.exports = function (api, options) {
	api.beforeBuild(() => {
		require('./scripts/prepare');
	});
}
