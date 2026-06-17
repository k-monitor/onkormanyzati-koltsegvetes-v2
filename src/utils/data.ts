import { shallowReactive } from "vue";
import configJson from "~/data/config.json";
import dataJson from "~/data/data.json";
import tagsJson from "../data/tags.json";
import tooltipsJson from "~/data/tooltips.json";

export const CONFIG = configJson;
export const DATA = dataJson as BudgetData;

// Milestones can be large (kokoko) and are lazy-loaded at runtime from a static
// JSON asset rather than bundled — see plugins/milestones.client.ts. These start
// empty and are filled reactively once the fetch resolves, so any computed/render
// that iterates them (MapSection, MilestoneSection, search, …) updates by itself.
// shallowReactive (not reactive): the entries are read-only, so we only need the
// top-level key-add to be reactive — deep-proxying lot of objects is pure overhead.
export const MILESTONES = shallowReactive<Record<string, Milestone>>({});
export const MILESTONE_RELS = shallowReactive<
	Record<string, Record<string, string>>
>({});

// Milestones grouped by year, with their id baked in. Built once at load so views
// (MilestoneSection, canShowMilestones) get an O(1) per-year lookup instead of
// rescanning all milestones through the reactive proxy on every year switch.
export const MILESTONES_BY_YEAR = shallowReactive<
	Record<string, MilestoneWithId[]>
>({});

export function setMilestones(data: Milestones) {
	Object.assign(MILESTONES, data.milestones);
	Object.assign(MILESTONE_RELS, data.rels);

	// Iterate the raw fetched object (cheap) rather than the reactive proxy.
	const byYear: Record<string, MilestoneWithId[]> = {};
	for (const [id, m] of Object.entries(data.milestones)) {
		(byYear[String(m.year)] ||= []).push({ ...m, id });
	}
	Object.assign(MILESTONES_BY_YEAR, byYear);
}

export const TAGS = tagsJson;
export const TOOLTIPS = tooltipsJson as Record<string, Record<string, string>>;

// disabling modules if there's no data
if (Object.values(DATA).some((b) => !b.income)) CONFIG.modules.income = 0;
if (!CONFIG.modules.income) CONFIG.modules.inex = 0;

// fixing default year on the fly
const years = Object.keys(DATA);
if (years[0] && !years.includes(String(CONFIG.defaultYear))) {
	CONFIG.defaultYear = years[0];
}
