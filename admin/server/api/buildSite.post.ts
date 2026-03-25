import { tryStartBuildSite } from '../utils/buildSiteState';

export default defineEventHandler(async (event) => {
	if (!tryStartBuildSite()) {
		setResponseStatus(event, 503);
		return {
			error: 'A build folyamat mar fut.',
		};
	}

	return {
		started: true,
	};
});
