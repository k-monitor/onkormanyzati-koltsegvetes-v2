import { exec, type ExecException } from 'child_process';

export default defineEventHandler(async (event) => {
	const buildResult = await build();
	if (buildResult.error) {
		console.log('Build failed:', buildResult.error);
		setResponseStatus(event, 500);
		return buildResult;
	}

	// build is successful at this point
	// stderr can still contain useful warnings

	const deployResult = await deploy();
	if (deployResult.error) {
		console.log('Deploy failed:', deployResult.error);
		setResponseStatus(event, 500);
	}
	return {
		error: deployResult.error,
		stderr: [buildResult.stderr, deployResult.stderr].filter(Boolean).join('\n'),
	};
});

function build() {
	return new Promise<{ error: ExecException | null; stderr: string }>((resolve) => {
		console.log('Building site...');
		exec(
			'pnpm build',
			{
				cwd: useConfig().kokoDir,
				env: {
					...process.env, // needed for NVM to work
					NUXT_APP_BASE_URL: '/', // Nuxt default so don't pass what admin got
					// TODO LATER ^ consider using config value here
					NODE_ENV: 'production',
				},
			},
			(error, stdout, stderr) => {
				resolve({
					error,
					stderr,
				});
			},
		);
	});
}

function deploy() {
	const deployCmd = useConfig().deployCmd;
	return new Promise<{ error: ExecException | null; stderr: string }>((resolve) => {
		if (!deployCmd) return resolve({ error: null, stderr: '' });
		exec(
			deployCmd,
			{
				cwd: useConfig().kokoDir,
			},
			(error, _stdout, stderr) => {
				resolve({
					error,
					stderr,
				});
			},
		);
	});
}
