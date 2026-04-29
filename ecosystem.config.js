module.exports = {
	apps: [
		{
			name: 'koko-admin',
			interpreter: 'node@24.12.0',
			node_args: '--env-file=admin/.env',
			script: 'admin/.output/server/index.mjs',
			log_date_format: 'YYYY-MM-DD HH:mm Z',
		},
	],
};
