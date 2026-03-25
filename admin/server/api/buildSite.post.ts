import { tryStartBuildSite } from '../utils/buildSiteState';

export default defineEventHandler(async (event) => {
	if (!tryStartBuildSite()) {
		setResponseStatus(event, 503);
		return {
			error: 'A generálás épp folyamatban van.',
		};
	}

	return {
		started: true,
	};
});
