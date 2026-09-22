import { shallowReactive } from "vue";
import configJson from "~/data/config.json";
import dataJson from "~/data/data.json";
import tagsJson from "../data/tags.json";
import tooltipsJson from "~/data/tooltips.json";

export const CONFIG = configJson;
export const DATA = dataJson as BudgetData;

// Milestones can be large (kokoko) and are lazy-loaded at runtime from static
// JSON assets rather than bundled — see plugins/milestones.client.ts. Only a small
// index (rels, per-year counts, map milestones) is fetched up front; a year's full
// milestones (with the heavy descriptions) are fetched by loadMilestones() when
// that year is viewed or searched. The stores start empty and fill reactively, so
// any computed/render that iterates them (MapSection, MilestoneSection, search, …)
// updates by itself.
// shallowReactive (not reactive): the entries are read-only, so we only need the
// top-level key-add to be reactive — deep-proxying lot of objects is pure overhead.
export const MILESTONES = shallowReactive<Record<string, Milestone>>({});
export const MILESTONE_RELS = shallowReactive<
	Record<string, Record<string, string>>
>({});
export const MILESTONE_COUNTS = shallowReactive<Record<string, number>>({});

// Milestones grouped by year, with their id baked in. Built once per loaded year
// so views (MilestoneSection) get an O(1) per-year lookup instead of rescanning
// all milestones through the reactive proxy on every year switch.
export const MILESTONES_BY_YEAR = shallowReactive<
	Record<string, MilestoneWithId[]>
>({});

let milestonesBaseUrl = '';
let milestonesIndex: Promise<void> | null = null;
const milestoneFiles: Record<string, string> = {};
const milestoneYearLoads: Record<string, Promise<void>> = {};

export function initMilestones(baseUrl: string) {
	milestonesBaseUrl = baseUrl;
	milestonesIndex ||= $fetch<MilestonesIndex>(baseUrl + '/index.json')
		.then((index) => {
			Object.assign(MILESTONE_RELS, index.rels);
			Object.assign(MILESTONES, index.positioned);
			for (const [year, { file, count }] of Object.entries(index.years)) {
				milestoneFiles[year] = file;
				MILESTONE_COUNTS[year] = count;
			}
		})
		.catch((error) => {
			console.error('Failed to load milestones index from', baseUrl, error);
		});
	return milestonesIndex;
}

// Fetches the full milestones of the given year, or of every year when no year
// is given. Safe to call repeatedly: each year is fetched at most once.
export async function loadMilestones(year?: string | null) {
	if (!milestonesIndex) return; // SSR / plugin not run
	await milestonesIndex;
	const years = year ? [String(year)] : Object.keys(milestoneFiles);
	await Promise.all(years.map(loadMilestonesOfYear));
}

function loadMilestonesOfYear(year: string) {
	const file = milestoneFiles[year];
	if (!file) return Promise.resolve();
	return (milestoneYearLoads[year] ||= $fetch<Record<string, Milestone>>(
		milestonesBaseUrl + '/' + file,
	)
		.then((milestones) => {
			Object.assign(MILESTONES, milestones);
			// Iterate the raw fetched object (cheap) rather than the reactive proxy.
			MILESTONES_BY_YEAR[year] = Object.entries(milestones).map(([id, m]) => ({
				...m,
				id,
			}));
		})
		.catch((error) => {
			delete milestoneYearLoads[year]; // allow a retry
			console.error('Failed to load milestones of', year, error);
		}));
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
