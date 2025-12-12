import { exec } from 'child_process';

export default defineEventHandler((event) => {
	const { deployCmd } = useRuntimeConfig();
	if (!deployCmd) return { error: null, stderr: '' };
	return new Promise((resolve, reject) => {
		exec(deployCmd, (error, stdout, stderr) => {
			setResponseStatus(event, error ? 500 : 200);
			resolve({
				error,
				stderr,
			});
		});
	});
});
