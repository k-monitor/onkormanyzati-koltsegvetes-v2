module.exports = {
	apps: [
		{
			name: 'koko-admin',
			node_args: '--env-file=admin/.env',
			script: 'admin/.output/server/index.mjs',
			log_date_format: 'YYYY-MM-DD HH:mm Z',
		},
	],
};
