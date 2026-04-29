export default () => ({
	adminUser: get('ADMIN_USER'),
	adminPass: get('ADMIN_PASS'),
	secondUser: get('SECOND_USER'),
	secondPass: get('SECOND_PASS'),
	publicUrl: get('PUBLIC_URL'),
	deployCmd: get('DEPLOY_CMD'),
	kokoDir: get('KOKO_DIR', import.meta.server ? process.cwd() : ''),
});

function get(key: string, defaultValue: string = ''): string {
	if (!import.meta.server) return ''; // make sure read can only happen on server
	return process.env[key] || defaultValue;
}
