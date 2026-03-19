import { exec } from 'child_process';

export default () => {
	return new Promise((resolve) => {
		exec(
			'pnpm prepare',
			{
				cwd: useConfig().kokoDir,
			},
			resolve,
		);
	});
};
