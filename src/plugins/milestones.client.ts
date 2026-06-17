// Lazy-loads the milestones dataset from a static JSON asset on the client.
//
// Milestones can be tens of MB (for kokoko) and are only needed for the
// map, the milestones grid and search. Bundling them OOMs `nuxt generate` during
// prerender and ships a ~23 MB chunk to every visitor. Instead we keep the stores
// empty at build/SSR time and fetch them here after the app mounts. The fetch is
// fire-and-forget (not awaited) so it never blocks first paint; consumers read the
// reactive MILESTONES / MILESTONE_RELS stores, which update once the data arrives.
export default defineNuxtPlugin(() => {
	const baseURL = useRuntimeConfig().app.baseURL || "/";
	const url = baseURL.replace(/\/$/, "") + "/data/milestones.json";

	$fetch<Milestones>(url)
		.then((data) => setMilestones(data))
		.catch((error) => {
			console.error("Failed to load milestones from", url, error);
		});
});
