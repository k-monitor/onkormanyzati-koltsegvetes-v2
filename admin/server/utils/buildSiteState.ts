import { exec, type ExecException } from 'child_process';

type BuildStatus = 'idle' | 'running' | 'success' | 'failed';

type BuildSiteState = {
	status: BuildStatus;
	stderr: string;
	error: string;
	startedAt: string | null;
	finishedAt: string | null;
};

const state: BuildSiteState = {
	status: 'idle',
	stderr: '',
	error: '',
	startedAt: null,
	finishedAt: null,
};

function normalizeError(error: ExecException | null): string {
	if (!error) return '';
	return error.message || String(error);
}

function runBuildStep(command: string, env?: NodeJS.ProcessEnv) {
	return new Promise<{ error: ExecException | null; stderr: string }>((resolve) => {
		exec(
			command,
			{
				cwd: useConfig().kokoDir,
				env,
			},
			(error, _stdout, stderr) => {
				resolve({ error, stderr });
			},
		);
	});
}

export function getBuildSiteState() {
	return {
		...state,
	};
}

export function tryStartBuildSite() {
	if (state.status === 'running') return false;

	state.status = 'running';
	state.stderr = '';
	state.error = '';
	state.startedAt = new Date().toISOString();
	state.finishedAt = null;

	void runBuildAndDeploy();
	return true;
}

async function runBuildAndDeploy() {
	try {
		const buildResult = await runBuildStep('pnpm build', {
			...process.env,
			NUXT_APP_BASE_URL: '/', // TODO not elegant here, remove when meta admin gets fixed
			NODE_ENV: 'production',
		});

		state.stderr = buildResult.stderr || '';
		if (buildResult.error) {
			state.status = 'failed';
			state.error = normalizeError(buildResult.error);
			state.finishedAt = new Date().toISOString();
			return;
		}

		const deployCmd = useConfig().deployCmd;
		if (!deployCmd) {
			state.status = 'success';
			state.finishedAt = new Date().toISOString();
			return;
		}

		const deployResult = await runBuildStep(deployCmd);
		state.stderr = [state.stderr, deployResult.stderr].filter(Boolean).join('\n');
		state.error = normalizeError(deployResult.error);
		state.status = deployResult.error ? 'failed' : 'success';
		state.finishedAt = new Date().toISOString();
	} catch (error) {
		state.status = 'failed';
		state.error = String(error);
		state.finishedAt = new Date().toISOString();
	}
}
