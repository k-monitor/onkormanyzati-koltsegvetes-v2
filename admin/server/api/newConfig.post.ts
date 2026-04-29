import { exec } from 'child_process';

export default defineEventHandler(async (event) => {
	exec('node scripts/generate-config.js', (error, stdout, stderr) => {
		if (error) {
			console.error('ERROR', error.message);
			console.error(stderr);
		}
		setResponseStatus(event, error ? 500 : 200);
	});
});
