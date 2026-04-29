import { getBuildSiteState } from '../utils/buildSiteState';

export default defineEventHandler(async () => {
	return getBuildSiteState();
});