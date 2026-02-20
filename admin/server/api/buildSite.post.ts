import { exec, type ExecException } from 'child_process';

export default defineEventHandler(async (event) => {
	const buildResult = await build();
	if (buildResult.error) {
		setResponseStatus(event, 500);
		return buildResult;
	}

	// build is successful at this point
	// stderr can still contain useful warnings

	const deployResult = await deploy();
	if (deployResult.error) {
		setResponseStatus(event, 500);
	}
	return {
		error: deployResult.error,
		stderr: [buildResult.stderr, deployResult.stderr].filter(Boolean).join('\n'),
	};
});

function build() {
	return new Promise<{ error: ExecException | null; stderr: string }>((resolve) => {
		exec(
			'pnpm build',
			{
				env: {
					...process.env,
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
	const { deployCmd } = useRuntimeConfig(); // NUXT_ prefixed overrides
	const DEPLOY_CMD = deployCmd || process.env.DEPLOY_CMD || '';
	return new Promise<{ error: ExecException | null; stderr: string }>((resolve) => {
		if (!DEPLOY_CMD) resolve({ error: null, stderr: '' });
		exec(DEPLOY_CMD, (error, _stdout, stderr) => {
			resolve({
				error,
				stderr,
			});
		});
	});
}
