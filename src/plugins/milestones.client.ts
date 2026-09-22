// Lazy-loads the milestones dataset from static JSON assets on the client.
//
// Milestones can be tens of MB (for kokoko) and are only needed for the
// map, the milestones grid and search. Bundling them OOMs `nuxt generate` during
// prerender and ships a huge chunk to every visitor. Instead we keep the stores
// empty at build/SSR time and fetch only the small index here after the app
// mounts; per-year files are fetched on demand via loadMilestones(). The fetch is
// fire-and-forget (not awaited) so it never blocks first paint; consumers read the
// reactive MILESTONES / MILESTONE_RELS / MILESTONE_COUNTS stores, which update
// once the data arrives.
export default defineNuxtPlugin(() => {
	const baseURL = useRuntimeConfig().app.baseURL || "/";
	initMilestones(baseURL.replace(/\/$/, "") + "/data/milestones");
});
