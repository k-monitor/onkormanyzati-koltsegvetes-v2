import { exec } from 'child_process';

export default defineEventHandler((event) => {
	return new Promise((resolve) => {
		exec(
			'pnpm build',
			{
				env: {
					...process.env,
					NODE_ENV: 'production',
				},
			},
			(error, stdout, stderr) => {
				setResponseStatus(event, error ? 500 : 200);
				resolve({
					error,
					stderr,
				});
			},
		);
	});
});
