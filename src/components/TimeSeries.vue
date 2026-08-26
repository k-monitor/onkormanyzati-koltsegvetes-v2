<script setup lang="ts">
import tinycolor from 'tinycolor2';

const {
	side,
	view = 'func',
	embedded = false,
} = defineProps<{
	side: 'expense' | 'income';
	view?: 'func' | 'econ';
	embedded?: boolean;
}>();

function normalizeId(id: string | number | undefined): string {
	if (id === undefined) return '';

	const s = String(id);
	// Strip leading zeros from purely numeric IDs (e.g. "01" → "1")
	if (/^\d+$/.test(s)) return String(Number(s));
	// Strip leading zeros from letter-prefixed numeric IDs (e.g. "K01" → "K1", "K0000001" → "K1")
	return s.replace(
		/^([A-Za-z]+)0*(\d+)$/,
		(_, prefix, digits) => prefix + String(Number(digits)),
	);
}

// Config values come from XLSX cells, so a "0" may arrive as a string.
function configEnabled(value: unknown): boolean {
	const v = String(value ?? '')
		.trim()
		.toLowerCase();
	return v !== '' && v !== '0' && v !== 'false';
}

// Items are identified by their key: the AHT code when we have one (see the
// cross-year matching block below), the normalized economic ID otherwise.
const path = ref<string[]>([]);
const hovered = ref<string | null>(null);
// Year of the hovered bar; null when the hover came from the legend, which
// isn't tied to a year.
const hoveredYear = ref<string | null>(null);
const hoverSide = ref<'left' | 'right'>('left');
const hiddenSeries = ref<Set<string>>(new Set());
// mode: 'regular' | 'inflation' | 'gdp'
const mode = ref<'regular' | 'inflation' | 'gdp'>('regular');

// Reset path when view changes
watch(
	() => view,
	() => {
		path.value = [];
		hovered.value = null;
		hoveredYear.value = null;
		hiddenSeries.value = new Set();
	},
);

// Toggle series visibility
function toggleSeriesVisibility(key: string, event: Event) {
	event.stopPropagation();
	const newSet = new Set(hiddenSeries.value);
	if (newSet.has(key)) {
		newSet.delete(key);
	} else {
		newSet.add(key);
	}
	hiddenSeries.value = newSet;
}

// Check if inflation feature is enabled
const inflationEnabled = computed(() => !!CONFIG.timeseries?.inflation);

// GDP feature enabled if yearly GDP data exists
const gdpEnabled = computed(() => !!CONFIG.timeseries?.gdp);

// Get GDP values from config (should be { year: value })
const gdpValues = computed(() => {
	if (!CONFIG.gdps) return {};
	const normalized: Record<string, number> = {};
	for (const [year, rawValue] of Object.entries(CONFIG.gdps as Record<string, unknown>)) {
		const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
		if (Number.isFinite(value)) {
			normalized[year] = value;
		}
	}
	return normalized;
});

// Get inflation rates from config object (timeseries.inflations.2020, timeseries.inflations.2021, etc.)
const inflationRates = computed(() => {
	if (!CONFIG.inflations) return {};
	return CONFIG.inflations as Record<string, number>;
});

// Calculate cumulative inflation multipliers for each year (base = last/most recent year).
// Each data year is matched to the longest inflation key that is a prefix of it,
// so keys like "2021" match "2021 valami" and "2021. 01." match "2021. 01. valami".
const inflationMultipliers = computed(() => {
	const multipliers: Record<string, number> = {};
	const rates = inflationRates.value;

	if (years.value.length === 0) return multipliers;

	const sortedInflationKeys = Object.keys(rates).sort();

	function longestPrefixMatch(dataYear: string): string | null {
		let best: string | null = null;
		for (const k of sortedInflationKeys) {
			if (dataYear.startsWith(k) && (best === null || k.length > best.length)) {
				best = k;
			}
		}
		return best;
	}

	const lastYear = years.value[years.value.length - 1]!;
	multipliers[lastYear] = 1;

	// The base year is usually a plan year that has no inflation figure of its own, and
	// the first year of data can predate the rates — in both cases fall back to the year
	// label as the range bound. Labels and inflation keys both start with the year, so
	// they still compare correctly against each other.
	const lastKey = longestPrefixMatch(lastYear) ?? lastYear;
	const firstKey = longestPrefixMatch(years.value[0]!) ?? years.value[0]!;

	// Inflation keys between firstKey (inclusive) and lastKey (exclusive) — covers gaps in data years
	const relevantKeys = sortedInflationKeys.filter((k) => k >= firstKey && k < lastKey);

	const cumulativeByKey: Record<string, number> = {};
	let cumulative = 1;
	for (let i = relevantKeys.length - 1; i >= 0; i--) {
		const k = relevantKeys[i]!;
		const rate = rates[k] || 0;
		cumulative *= 1 + rate / 100;
		cumulativeByKey[k] = cumulative;
	}

	// Several data years can share one inflation key ("2024" and "2024 zárszámadás" both
	// match "2024"), so each year resolves its own multiplier instead of the key claiming
	// a single year.
	for (const dy of years.value) {
		const k = longestPrefixMatch(dy);
		const value = k === null ? undefined : cumulativeByKey[k];
		if (value !== undefined) multipliers[dy] = value;
	}

	// console.debug('[inflation] final multipliers:', multipliers);
	return multipliers;
});

// Get all years that have data for this side and view
const years = computed(() => {
	// Parse allowed years from config (comma-separated string)
	const allowedYears = CONFIG.timeseries?.years
		? String(CONFIG.timeseries.years || '')
				.split(',')
				.map((y: string) => y.trim())
		: null;
	const gdp = gdpValues.value;

	return Object.keys(DATA)
		.filter((year) => DATA[year]?.[side]?.[view])
		.filter((year) => !allowedYears || allowedYears.includes(year))
		.filter((year) => mode.value !== 'gdp' || (typeof gdp[year] === 'number' && gdp[year] > 0))
		.sort();
});

// Build link to the year's expense/income section
function yearHref(year: string): string {
	const section = side === 'income' ? 'bevetel' : 'kiadas';
	return `/ev#${slugify(year)}/${section}`;
}

// Get the root node for a specific year
function getRootForYear(year: string): BudgetNode | null {
	return DATA[year]?.[side]?.[view] || null;
}

// Parse allowed IDs for time series filtering from config (kgr sheet)
const kgrFilter = computed(() => {
	if (!CONFIG.timeseries?.kgr || !CONFIG.timeseries.kgrOnly) return null;
	const ids = (CONFIG.timeseries.kgr as string)
		.split(',')
		.map((s: string) => normalizeId(s.trim()))
		.filter((s: string) => s.length > 0);
	return ids.length > 0 ? new Set(ids) : null;
});

// Skip the balance rows (FH/FT), they are only meant for the Mérleg chart
function isBalanceItem(node: BudgetNode): boolean {
	return normalizeId(node.id).startsWith('F');
}

function passesKgrFilter(node: BudgetNode): boolean {
	if (view !== 'econ' || !kgrFilter.value) return true;
	return kgrFilter.value.has(normalizeId(node.id));
}

function isVisibleChild(node: BudgetNode): boolean {
	return !isBalanceItem(node) && passesKgrFilter(node);
}

/* --- Cross-year matching by AHT code ---------------------------------------
 * Economic IDs (K1101…) encode where an item sits in the budget, so they get
 * renumbered whenever something is inserted or removed above them — the same
 * item can be K11010404 one year and K11010403 the next. Names change too.
 * AHT ("államháztartási azonosító") codes stay with the item, so when the
 * budget provides them (see the `timeseries.aht` config option) series are
 * keyed by AHT instead of by position, and an item that was reorganized into
 * another place can still be found and followed — flagged as uncertain.
 */

const AHT_KEY_PREFIX = 'aht:';

type AhtEntry = {
	node: BudgetNode;
	/** Ancestors from the root down to the node's parent. */
	parents: BudgetNode[];
};

const ahtLookup = computed(() => {
	const byYear: Record<string, Map<string, AhtEntry>> = {};
	// Economic IDs of the AHT-keyed nodes, for config lookups keyed by ID (colors).
	const econIds = new Map<string, string>();
	let found = false;

	// AHT codes only exist on the economic side — the functional tree is built
	// from functions.tsv, where the IDs are already stable across years.
	if (view !== 'econ' || !configEnabled(CONFIG.timeseries?.aht)) {
		return { byYear, econIds, found };
	}

	for (const year of years.value) {
		const root = getRootForYear(year);
		if (!root) continue;
		const map = new Map<string, AhtEntry>();
		const parents: BudgetNode[] = [];
		const walk = (node: BudgetNode) => {
			// A code should appear once per year; on a duplicate we keep the first.
			if (node.aht && !map.has(node.aht)) {
				map.set(node.aht, { node, parents: [...parents] });
				econIds.set(AHT_KEY_PREFIX + node.aht, normalizeId(node.id));
				found = true;
			}
			if (node.children) {
				parents.push(node);
				node.children.forEach(walk);
				parents.pop();
			}
		};
		walk(root);
		byYear[year] = map;
	}

	return { byYear, econIds, found };
});

// Enabled by config *and* actually present in the data
const ahtEnabled = computed(() => ahtLookup.value.found);

/**
 * config.json only carries the rows the budget's own config.xlsx fills in, so
 * an option added later isn't part of its inferred type.
 */
function timeseriesOption(key: string): unknown {
	return (CONFIG.timeseries as Record<string, unknown> | undefined)?.[key];
}

/**
 * Whether an AHT code may be followed into another part of the budget — a
 * different chapter or title than the one being shown. Those items are money
 * that isn't in this section that year, so they can be left out and the series
 * simply ends. Items that only moved *deeper* inside the shown item are
 * unaffected; they are part of it either way.
 *
 * `timeseries.ahtOtherSections` sets where the chart starts; the reader flips it
 * with the toggle next to the display modes. The option is missing from config
 * files written before it existed, where the items were always followed — an
 * empty cell keeps that.
 */
function configuredOtherSections(): boolean {
	const value = timeseriesOption('ahtOtherSections');
	if (value === undefined || String(value).trim() === '') return true;
	return configEnabled(value);
}

const showOtherSections = ref(configuredOtherSections());

function seriesKey(node: BudgetNode): string {
	if (ahtEnabled.value && node.aht) return AHT_KEY_PREFIX + node.aht;
	return normalizeId(node.id);
}

/**
 * Two items of a level can share a key — a renamed chapter that split off from
 * an earlier series keeps the AHT code it inherited — so the later one carries
 * a `#n` suffix. Everything that looks the key up in the budget wants the plain
 * one.
 */
function baseKey(key: string): string {
	return key.replace(/#\d+$/, '');
}

function ahtOfKey(key: string): string | null {
	const plain = baseKey(key);
	return plain.startsWith(AHT_KEY_PREFIX) ? plain.slice(AHT_KEY_PREFIX.length) : null;
}

function findByAht(year: string, key: string): AhtEntry | null {
	const aht = ahtOfKey(key);
	if (!aht) return null;
	return ahtLookup.value.byYear[year]?.get(aht) || null;
}

// Colors are configured per economic ID, so AHT keys need translating back.
function colorKey(key: string): string {
	const plain = baseKey(key);
	return ahtLookup.value.econIds.get(plain) || plain;
}

// How many ancestor levels a warning names. The full path from the root repeats
// context the reader already has from the breadcrumb, and turns the warnings
// into a wall of text as soon as a few items moved in the same year.
const LOCATION_LEVELS = 2;

// Human-readable place of an item inside a year's tree, for the warnings
function describeLocation(parents: BudgetNode[]): string {
	const names = locationNames(parents);
	if (names.length === 0) return 'Összesen';
	const innermost = names.slice(-LOCATION_LEVELS);
	return (innermost.length < names.length ? '… → ' : '') + innermost.join(' → ');
}

function locationNames(parents: BudgetNode[]): string[] {
	return parents.map((p) => p.name).filter((name) => name && name !== 'Összesen');
}

// The whole path from the top of the budget down to the item, for the tooltips
// that talk about a single year and have room to spell it out.
function fullLocation(parents: BudgetNode[]): string {
	const names = locationNames(parents);
	return names.length === 0 ? 'Összesen' : names.join(' → ');
}

/**
 * Walks `keys` down a year's tree. A step that isn't among the children is
 * looked up by its AHT code anywhere in that year's tree, so a reorganized
 * item is still found — `movedTo` then tells where it turned up.
 */
function resolveForYear(
	year: string,
	keys: string[],
): { node: BudgetNode; movedTo: string | null } | null {
	const root = getRootForYear(year);
	if (!root) return null;
	let current = root;
	let movedTo: string | null = null;
	for (const key of keys) {
		let next = current.children?.find((child) => seriesKey(child) === baseKey(key));
		if (!next) {
			const entry = findByAht(year, key);
			if (!entry) return null;
			// Found somewhere else than under the item we are walking down — that
			// is another section, and following it is optional.
			if (!showOtherSections.value && !entry.parents.includes(current)) return null;
			next = entry.node;
			movedTo = describeLocation(entry.parents);
		}
		current = next;
	}
	return { node: current, movedTo };
}

function getNodeForYear(year: string, keys: string[]): BudgetNode | null {
	return resolveForYear(year, keys)?.node || null;
}

/**
 * Every AHT code inside a node's subtree, memoised (the trees come from a static
 * JSON import, so the sets stay valid for the lifetime of the page).
 */
const subtreeAhtCache = new WeakMap<BudgetNode, Set<string>>();
function subtreeAhtCodes(node: BudgetNode): Set<string> {
	const cached = subtreeAhtCache.get(node);
	if (cached) return cached;
	const codes = new Set<string>();
	const walk = (n: BudgetNode) => {
		if (n.aht) codes.add(n.aht);
		n.children?.forEach(walk);
	};
	walk(node);
	subtreeAhtCache.set(node, codes);
	return codes;
}

/**
 * How much two nodes contain the same budget items, as a Jaccard index of their
 * AHT code sets. Section-level nodes (chapters, titles) often have no AHT of
 * their own, or get a new one when the budget is restructured, so their own code
 * can't identify them across years — but their content still can.
 */
function contentSimilarity(a: BudgetNode, b: BudgetNode) {
	const codesA = subtreeAhtCodes(a);
	const codesB = subtreeAhtCodes(b);
	// Without codes on both sides there is nothing to compare — `comparable`
	// keeps that apart from "compared, and they have nothing in common".
	if (codesA.size === 0 || codesB.size === 0)
		return { shared: 0, similarity: 0, coverage: 0, comparable: false };
	const [small, large] = codesA.size <= codesB.size ? [codesA, codesB] : [codesB, codesA];
	let shared = 0;
	for (const code of small) if (large.has(code)) shared++;
	return {
		shared,
		similarity: shared / (codesA.size + codesB.size - shared),
		// Share of the bigger side that both have — "half of the codes match".
		coverage: shared / large.size,
		comparable: true,
	};
}

// Below this the two nodes have too little in common to call them the same item.
// Tuned on the central budget: real renames land at 0.4+, genuinely different
// funds and chapters that happen to swap places stay near 0.1.
const MIN_CONTENT_SIMILARITY = 0.4;

// An item that kept its identifier but changed its name has to share at least
// this much of its AHT codes to count as the same series. A chapter that was
// renamed *and* gutted — its programmes handed to other chapters — would
// otherwise be drawn as a continuation of the old one, turning the split into a
// spectacular drop. (EMMI → Kulturális és Innovációs Minisztérium in 2023
// shares 27% of its codes; genuine renames like NGM → PM stay above 60%.)
const MIN_RENAMED_COVERAGE = 0.5;

function normalizeName(name: string): string {
	return (
		(name || '')
			.toLowerCase()
			// Chapters get renumbered without becoming a different chapter.
			.replace(/^[ivxlcdm]+\.\s+/, '')
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim()
	);
}

/**
 * Whether a year's node can carry on an existing series. Same name: yes — that
 * is what the matching found it by. Renamed: only if the AHT codes below the
 * two still mostly agree, so a rename that came with a reorganization starts a
 * new series instead.
 */
function continuesSeries(
	child: BudgetNode,
	previous: BudgetNode,
	match?: ReturnType<typeof contentSimilarity>,
): boolean {
	if (normalizeName(child.name) === normalizeName(previous.name)) return true;
	if (!ahtEnabled.value) return true;
	const overlap = match ?? contentSimilarity(child, previous);
	// Nothing to compare — no reason to break the series apart.
	if (!overlap.comparable) return true;
	return overlap.coverage >= MIN_RENAMED_COVERAGE;
}

// Years where the item we drilled into is not in its usual place
const pathMoves = computed(() => {
	const result: Record<string, string> = {};
	if (!ahtEnabled.value || path.value.length === 0) return result;
	for (const year of years.value) {
		const movedTo = resolveForYear(year, path.value)?.movedTo;
		if (movedTo) result[year] = movedTo;
	}
	return result;
});

/** One item of the current level, with the node it maps to in each year. */
type LevelItem = {
	key: string;
	/** Most recent node of the item — provides its label and its AHT code. */
	node: BudgetNode;
	byYear: Record<string, BudgetNode>;
	/** Every AHT code the item was seen under, newest first. */
	ahts: string[];
	/** Years matched by content rather than by AHT code / economic ID. */
	rematches: Record<string, { from: string; shared: number; similarity: number }>;
};

/**
 * The items of the current level, aligned across years (union, so items only
 * present in some years still appear). Matching goes AHT code → economic ID →
 * content similarity, the last one covering the section levels: chapters and
 * titles are renumbered and renamed freely, and often carry no AHT code of
 * their own, so without it the same ministry would be split into two series
 * (and mixed with whatever else took its place).
 */
const levelItems = computed(() => {
	const items: LevelItem[] = [];
	const byKey = new Map<string, LevelItem>();
	let leafFallback: BudgetNode | null = null;

	for (const year of years.value) {
		const node = getNodeForYear(year, path.value);
		if (!node) continue;
		const children = (node.children || []).filter(isVisibleChild);
		if (children.length === 0) {
			if (!leafFallback) leafFallback = node;
			continue;
		}

		let unmatched: BudgetNode[] = [];
		for (const child of children) {
			const item = byKey.get(seriesKey(child));
			// A shared identifier is not enough when the name changed too — see
			// `continuesSeries`; such a child starts a series of its own below.
			if (item && !item.byYear[year] && continuesSeries(child, item.node)) {
				item.byYear[year] = child;
				// years.value is sorted ascending, so later iterations overwrite
				// earlier ones — the label tracks the most recent name.
				item.node = child;
				if (child.aht && item.ahts[0] !== child.aht) item.ahts.unshift(child.aht);
			} else {
				unmatched.push(child);
			}
		}

		if (ahtEnabled.value && unmatched.length > 0) {
			// Items with nothing at this level in this year, and whose AHT codes are
			// gone for good — none of them shows up in this or any later year. An
			// item whose code comes back later didn't get renamed: the budget was
			// restructured around it (a level inserted or removed), and gluing it to
			// whatever took its place would splice two different items together.
			// Items still present elsewhere in the tree are excluded by the same
			// test; those were relocated, and are picked up as such further down.
			const remainingYears = years.value.slice(years.value.indexOf(year));
			const open = items.filter(
				(item) =>
					!item.byYear[year] &&
					!item.ahts.some((aht) =>
						remainingYears.some((later) => ahtLookup.value.byYear[later]?.has(aht)),
					),
			);
			const pairs: {
				child: BudgetNode;
				item: LevelItem;
				shared: number;
				similarity: number;
			}[] = [];
			for (const child of unmatched) {
				for (const item of open) {
					const match = contentSimilarity(child, item.node);
					if (
						match.similarity >= MIN_CONTENT_SIMILARITY &&
						continuesSeries(child, item.node, match)
					)
						pairs.push({ child, item, ...match });
				}
			}
			// Greedy: the most similar pair wins, then both sides are taken.
			pairs.sort((a, b) => b.similarity - a.similarity);
			const takenChildren = new Set<BudgetNode>();
			const takenItems = new Set<LevelItem>();
			for (const pair of pairs) {
				if (takenChildren.has(pair.child) || takenItems.has(pair.item)) continue;
				takenChildren.add(pair.child);
				takenItems.add(pair.item);
				pair.item.rematches[year] = {
					from: pair.item.node.name,
					shared: pair.shared,
					similarity: pair.similarity,
				};
				pair.item.byYear[year] = pair.child;
				pair.item.node = pair.child;
				if (pair.child.aht) pair.item.ahts.unshift(pair.child.aht);
				// Register the new key so the following years match without a search.
				byKey.set(seriesKey(pair.child), pair.item);
			}
			unmatched = unmatched.filter((child) => !takenChildren.has(child));
		}

		for (const child of unmatched) {
			// A key can already be taken — by an earlier content match, or by the
			// series this one just split off from. Suffixing keeps the two apart
			// instead of dropping one of them, and the newest item takes over the
			// key so the following years carry on with it.
			const key = seriesKey(child);
			const item: LevelItem = {
				key: byKey.has(key) ? `${key}#${items.length}` : key,
				node: child,
				byYear: { [year]: child },
				ahts: child.aht ? [child.aht] : [],
				rematches: {},
			};
			items.push(item);
			byKey.set(key, item);
		}
	}

	if (items.length === 0 && leafFallback) {
		items.push({
			key: seriesKey(leafFallback),
			node: leafFallback,
			byYear: {},
			ahts: leafFallback.aht ? [leafFallback.aht] : [],
			rematches: {},
		});
		return items;
	}

	return items.reverse();
});

type Series = {
	/** Series identity: AHT code when available, economic ID otherwise */
	key: string;
	aht: string | null;
	name: string;
	values: Record<string, number>;
	adjustedValues: Record<string, number>;
	names: Record<string, string>;
	/**
	 * Years where the item wasn't in its usual place and had to be located by
	 * its AHT code. `inside` means it turned up below this level, so its value
	 * is already part of another bar segment here — `container` is the key of
	 * that segment (null when it can't be identified). `at` is the shortened
	 * location for the summary tooltips, `path` the full one.
	 */
	moves: Record<string, { at: string; path: string; inside: boolean; container: string | null }>;
	/** Years matched by content similarity — see `levelItems`. */
	rematches: Record<string, { from: string; shared: number; similarity: number }>;
};

/**
 * Which item of the current level a node belongs to, so an item that moved
 * deeper can name the segment it ended up inside.
 */
const itemKeyByNode = computed(() => {
	const map = new Map<BudgetNode, string>();
	for (const item of levelItems.value) {
		for (const node of Object.values(item.byYear)) map.set(node, item.key);
	}
	return map;
});

// Build time series data for all children
const timeSeriesData = computed(() => {
	// The node the chart currently shows the breakdown of, per year — needed to
	// tell a relocation *below* this level from one somewhere else entirely.
	const levelNodes: Record<string, BudgetNode | null> = {};
	for (const year of years.value) levelNodes[year] = getNodeForYear(year, path.value);

	return levelItems.value.map((item) => {
		const series: Series = {
			key: item.key,
			aht: item.node.aht || null,
			name: item.node.name,
			values: {},
			adjustedValues: {},
			names: {},
			moves: {},
			rematches: item.rematches,
		};

		for (const year of years.value) {
			const multiplier = inflationMultipliers.value[year] || 1;
			const record = (node: BudgetNode) => {
				series.values[year] = node.value;
				series.adjustedValues[year] = node.value * multiplier;
				series.names[year] = node.name;
			};

			const node = item.byYear[year];
			if (node) {
				record(node);
				continue;
			}
			if (!ahtEnabled.value) continue;

			// Missing from this level: follow the AHT code to wherever the item
			// ended up this year, so the series stays comparable — but remember
			// that it was reorganized, as that makes the comparison uncertain.
			const entry = item.ahts
				.map((aht) => ahtLookup.value.byYear[year]?.get(aht))
				.find(Boolean);
			if (!entry) continue;
			// The code leads to another item of this level — the series split in
			// two (renamed and reorganized), and that node's value is its own.
			const owner = itemKeyByNode.value.get(entry.node);
			if (owner !== undefined && owner !== item.key) continue;
			const levelNode = levelNodes[year];
			// The ancestor right below the drilled-into node is the segment of this
			// bar that swallowed the item's value; no such ancestor means the item
			// left this part of the budget altogether.
			const depth = levelNode ? entry.parents.indexOf(levelNode) : -1;
			if (depth < 0 && !showOtherSections.value) continue;
			record(entry.node);
			const containerNode = depth >= 0 ? entry.parents[depth + 1] : undefined;
			series.moves[year] = {
				at: describeLocation(entry.parents),
				path: fullLocation(entry.parents),
				inside: depth >= 0,
				container: containerNode ? (itemKeyByNode.value.get(containerNode) ?? null) : null,
			};
		}

		return series;
	});
});

// Years where an item on the chart was reorganized — relocated in the tree, or
// only recognisable by its content — with a note for each. Surfaced as a ⚠
// marker above the year's bar.
const uncertainYears = computed(() => {
	const result: Record<string, { name: string; reason: string }[]> = {};
	if (!ahtEnabled.value) return result;
	const drilledName = nodePath.value[nodePath.value.length - 1]?.name || '';

	for (const year of years.value) {
		const entries: { name: string; reason: string }[] = [];
		if (pathMoves.value[year]) entries.push({ name: drilledName, reason: 'máshol szerepel' });
		for (const series of timeSeriesData.value) {
			if (hiddenSeries.value.has(series.key)) continue;
			const reason = shortReason(series, year);
			if (reason) entries.push({ name: series.name, reason });
		}
		if (entries.length > 0) result[year] = entries;
	}
	return result;
});

const hasUncertainty = computed(() => Object.keys(uncertainYears.value).length > 0);

function describeMove(move?: { at: string; path: string; inside: boolean }, full = false): string {
	if (!move) return '';
	const where = full ? move.path : move.at;
	return move.inside
		? `mélyebb szinten szerepel (${where}), az összege ott jelenik meg a sávban`
		: `máshol szerepel (${where})`;
}

function describeRematch(rematch?: { from: string; shared: number; similarity: number }): string {
	if (!rematch) return '';
	return `más azonosítóval szerepel, a tartalma alapján párosítva (előző neve: „${rematch.from}”, ${rematch.shared} közös AHT kód)`;
}

/**
 * Why a given year of a series is uncertain, or an empty string if it isn't.
 * `full` spells out the whole path — for tooltips that cover a single year.
 */
function describeUncertainty(series: Series, year: string, full = false): string {
	return describeMove(series.moves[year], full) || describeRematch(series.rematches[year]);
}

function isUncertain(series: Series, year: string): boolean {
	return !!series.moves[year] || !!series.rematches[year];
}

function hasAnyUncertainty(series: Series): boolean {
	return Object.keys(series.moves).length > 0 || Object.keys(series.rematches).length > 0;
}

/** The kind of trouble, without the location — for the compact year summary. */
function shortReason(series: Series, year: string): string {
	const move = series.moves[year];
	if (move) return move.inside ? 'mélyebb szinten szerepel' : 'máshol szerepel';
	if (series.rematches[year]) return 'más azonosítóval szerepel';
	return '';
}

/** "2018, 2020–2023" — consecutive years collapse into a range. */
function joinYears(list: string[]): string {
	const order = years.value;
	const sorted = [...list].sort((a, b) => order.indexOf(a) - order.indexOf(b));
	const runs: string[][] = [];
	for (const year of sorted) {
		const run = runs[runs.length - 1];
		const previous = run?.[run.length - 1];
		if (run && previous && order.indexOf(year) === order.indexOf(previous) + 1) run.push(year);
		else runs.push([year]);
	}
	return runs
		.map((run) => (run.length > 2 ? `${run[0]}–${run[run.length - 1]}` : run.join(', ')))
		.join(', ');
}

// Years that share the same explanation are listed together, so a series that
// sat elsewhere for eight years reads as one line instead of eight.
function uncertaintyTooltip(series: Series): string {
	const byNote = new Map<string, string[]>();
	for (const year of years.value) {
		const note = describeUncertainty(series, year);
		if (!note) continue;
		const list = byNote.get(note);
		if (list) list.push(year);
		else byNote.set(note, [year]);
	}
	const notes = [...byNote].map(([note, list]) => `${joinYears(list)}: ${note}`);
	return `Ez a tétel átszervezés miatt nem mindig ugyanott szerepel, ezért az összehasonlítás bizonytalan${series.aht ? ` (AHT: ${series.aht})` : ''}. ${notes.join('; ')}`;
}

// How many item names the year summary spells out before it just counts them.
const MAX_LISTED_ITEMS = 3;

function yearUncertaintyTooltip(year: string): string {
	const byReason = new Map<string, string[]>();
	for (const { name, reason } of uncertainYears.value[year] || []) {
		const list = byReason.get(reason);
		if (list) list.push(name);
		else byReason.set(reason, [name]);
	}
	const parts = [...byReason].map(([reason, names]) => {
		const rest = names.length - MAX_LISTED_ITEMS;
		const listed = names.slice(0, MAX_LISTED_ITEMS).join(', ');
		return `${reason}: ${listed}${rest > 0 ? ` és további ${rest} tétel` : ''}`;
	});
	return `${year} – átszervezés. ${parts.join('; ')}. Részletek a jelmagyarázat ⚠ jelénél.`;
}

// Helper to get display value (raw, inflation-adjusted, or GDP-adjusted)
function getDisplayValue(
	series: {
		values: Record<string, number>;
		adjustedValues: Record<string, number>;
	},
	year: string,
): number {
	if (mode.value === 'inflation' && inflationEnabled.value) {
		return series.adjustedValues[year] || 0;
	}
	if (mode.value === 'gdp' && gdpEnabled.value) {
		const gdp = gdpValues.value[year];
		if (gdp && gdp > 0) {
			// Show as percentage of GDP
			return ((series.values[year] || 0) / gdp) * 100;
		}
		return 0;
	}
	return series.values[year] || 0;
}

// Helper to get string value (raw, inflation-adjusted, or GDP-adjusted)
function getStringValue(
	series: {
		values: Record<string, number>;
		adjustedValues: Record<string, number>;
	},
	year: string,
): string {
	if (mode.value === 'inflation' && inflationEnabled.value) {
		return groupNums(series.adjustedValues[year] || 0);
	}
	if (mode.value === 'gdp' && gdpEnabled.value) {
		const gdp = gdpValues.value[year];
		if (gdp && gdp > 0) {
			// Show as percentage of GDP
			return (((series.values[year] || 0) / gdp) * 100).toFixed(2).replace('.', ',') + ' %';
		}
		return '0 %';
	}
	return groupNums(series.values[year] || 0);
}

// Get current node name for breadcrumb. Names can differ between years, so the
// first year that resolves a given level provides its label.
const nodePath = computed(() => {
	const result: { key: string; name: string }[] = [{ key: '', name: 'Összesen' }];

	for (const year of years.value) {
		for (let i = result.length - 1; i < path.value.length; i++) {
			const node = getNodeForYear(year, path.value.slice(0, i + 1));
			if (!node) break;
			result.push({ key: path.value[i]!, name: node.name });
		}
		if (result.length > path.value.length) break;
	}

	return result;
});

// Chart dimensions
const chartWidth = 800;
const chartHeight = 400;
const padding = { top: 20, right: 30, bottom: 40, left: 80 };
const innerWidth = chartWidth - padding.left - padding.right;
const innerHeight = chartHeight - padding.top - padding.bottom;

/**
 * Value a series contributes to the stacked bar. An item that moved *below*
 * this level is already counted inside another segment of the same bar, so
 * adding it again would inflate the stack — it is drawn inside that segment
 * instead (see `nestedSegments`). When the segment holding it is hidden, the
 * value isn't on the chart at all, so the item stacks on its own.
 */
function getStackValue(series: Series, year: string): number {
	const move = series.moves[year];
	if (move?.inside && !(move.container !== null && hiddenSeries.value.has(move.container))) {
		return 0;
	}
	return getDisplayValue(series, year);
}

// Calculate stacked data - cumulative values for each year (excluding hidden series)
const stackedData = computed(() => {
	const result: (Series & {
		stackedValues: Record<string, { y0: number; y1: number }>;
	})[] = [];

	// Initialize with raw values (only non-hidden series)
	for (const series of timeSeriesData.value) {
		if (hiddenSeries.value.has(series.key)) continue;
		result.push({
			...series,
			stackedValues: {},
		});
	}

	// Calculate stacked values for each year
	for (const year of years.value) {
		let cumulative = 0;
		for (const series of result) {
			const value = getStackValue(series, year);
			series.stackedValues[year] = {
				y0: cumulative,
				y1: cumulative + value,
			};
			cumulative += value;
		}
	}

	return result;
});

/**
 * Items that moved to a deeper level: their value is already inside another
 * segment of this bar, so they get no segment of their own — the bar would
 * double-count them. Where inside the bar they sit is only shown while the item
 * is hovered (from the legend, or from a year where it does have a segment);
 * the blocks are stacked from the base of the segment that holds them.
 */
const nestedSegments = computed(() => {
	const result: Record<string, { key: string; title: string; y0: number; y1: number }[]> = {};
	const byKey = new Map(stackedData.value.map((series) => [series.key, series]));

	for (const year of years.value) {
		const segments: { key: string; title: string; y0: number; y1: number }[] = [];
		// How much of each container is already taken by the blocks placed in it.
		const filled = new Map<string, number>();

		for (const series of timeSeriesData.value) {
			if (hiddenSeries.value.has(series.key)) continue;
			const containerKey = series.moves[year]?.container;
			// No container, or it's hidden — then getStackValue gave the item its own segment.
			const container = containerKey ? byKey.get(containerKey) : undefined;
			const span = container?.stackedValues[year];
			if (!container || !span) continue;

			const value = getDisplayValue(series, year);
			if (value <= 0) continue;
			const base = (filled.get(container.key) || 0) + span.y0;
			filled.set(container.key, (filled.get(container.key) || 0) + value);
			// Values are sums of their children, so a block fits inside its container —
			// clamp anyway, rather than let bad input draw outside the bar.
			const y0 = Math.min(base, span.y1);
			const y1 = Math.min(base + value, span.y1);
			if (y1 <= y0) continue;

			segments.push({ key: series.key, title: segmentTooltip(series, year), y0, y1 });
		}

		if (segments.length > 0) result[year] = segments;
	}

	return result;
});

// So a small item still shows up as a marker instead of a hairline.
const MIN_NESTED_HEIGHT = 2;

// Values of the parent node (the one we drilled into), per year, in current display mode.
// Used to render a dotted outline showing the previous-level bar when drilled down.
// Per-year state when drilled down:
//   'bars'    — breakdown data exists; stacked bars already render
//   'outline' — no breakdown at this level, but parent has a value → dotted outline
//   'na'      — no data at all for this year at the drilled-into node
const yearStates = computed(() => {
	const result: Record<string, 'bars' | 'outline' | 'na'> = {};
	if (path.value.length === 0) return result;
	for (const year of years.value) {
		const node = getNodeForYear(year, path.value);
		// Items that moved in from elsewhere are a breakdown of their own — even
		// when this node has no (visible) children left in this year, or when the
		// grouping itself was dissolved and only its former items remain.
		const hasBreakdown =
			!!node?.children?.some(isVisibleChild) ||
			timeSeriesData.value.some((series) => series.moves[year]);
		if (hasBreakdown) {
			result[year] = 'bars';
		} else if (node?.value && node.value > 0 && hiddenSeries.value.size === 0) {
			// With an active filter we only know the aggregate for this year,
			// not how it splits across visible/hidden series — mark N/A to avoid a misleading outline.
			result[year] = 'outline';
		} else {
			result[year] = 'na';
		}
	}
	return result;
});

const parentValues = computed(() => {
	if (path.value.length === 0) return null;
	const result: Record<string, number> = {};
	for (const year of years.value) {
		if (yearStates.value[year] !== 'outline') continue;
		const node = getNodeForYear(year, path.value);
		if (!node) continue;
		const raw = node.value;
		if (mode.value === 'inflation' && inflationEnabled.value) {
			const multiplier = inflationMultipliers.value[year] || 1;
			result[year] = raw * multiplier;
		} else if (mode.value === 'gdp' && gdpEnabled.value) {
			const gdp = gdpValues.value[year];
			result[year] = gdp && gdp > 0 ? (raw / gdp) * 100 : 0;
		} else {
			result[year] = raw;
		}
	}
	return result;
});

// Full sum of every item on the current level — including those hidden by the kgrOnly
// filter. Shown as a dotted outline so the visible (filtered) stack isn't mistaken for
// the level total. Only relevant in econ view with an active kgr filter, and only for
// years where the filter actually drops some items while leaving others visible.
const levelTotalValues = computed(() => {
	if (view !== 'econ' || !kgrFilter.value) return null;
	// When the user has isolated/hidden series, the stack no longer represents the
	// kgr-visible total, so the full-level line would be misleading — drop it entirely.
	if (hiddenSeries.value.size > 0) return null;
	const filter = kgrFilter.value;
	const result: Record<string, number> = {};
	let any = false;
	for (const year of years.value) {
		const node = getNodeForYear(year, path.value);
		if (!node?.children) continue;
		let fullSum = 0;
		let visibleCount = 0;
		let filteredOut = false;
		for (const child of node.children) {
			if (isBalanceItem(child)) continue;
			fullSum += child.value;
			if (filter.has(normalizeId(child.id))) {
				visibleCount++;
			} else {
				// Removed by the kgr filter — this is what the dotted line surfaces.
				filteredOut = true;
			}
		}
		// Only show when the kgr filter drops some items but a visible stack still renders.
		if (!filteredOut || visibleCount === 0 || fullSum <= 0) continue;
		let display = fullSum;
		if (mode.value === 'inflation' && inflationEnabled.value) {
			display = fullSum * (inflationMultipliers.value[year] || 1);
		} else if (mode.value === 'gdp' && gdpEnabled.value) {
			const gdp = gdpValues.value[year];
			display = gdp && gdp > 0 ? (fullSum / gdp) * 100 : 0;
		}
		result[year] = display;
		any = true;
	}
	return any ? result : null;
});

// Scale calculations - max is now total of all visible series
const maxValue = computed(() => {
	let max = 0;
	for (const year of years.value) {
		let total = 0;
		for (const series of timeSeriesData.value) {
			if (hiddenSeries.value.has(series.key)) continue;
			total += getStackValue(series, year);
		}
		if (total > max) max = total;
	}
	if (parentValues.value) {
		for (const year of years.value) {
			const v = parentValues.value[year] || 0;
			if (v > max) max = v;
		}
	}
	if (levelTotalValues.value) {
		for (const year of years.value) {
			const v = levelTotalValues.value[year] || 0;
			if (v > max) max = v;
		}
	}
	return max * 1.05; // Add 5% padding
});

const yScale = computed(() => {
	return (value: number) => {
		return innerHeight - (value / maxValue.value) * innerHeight;
	};
});

// Bar chart dimensions
const barPadding = 0.2; // 20% padding between bar groups
const barGroupWidth = computed(() => {
	const count = years.value.length;
	if (count === 0) return 0;
	return innerWidth / count;
});

const barWidth = computed(() => {
	return barGroupWidth.value * (1 - barPadding);
});

const xScale = computed(() => {
	const count = years.value.length;
	if (count === 0) return () => 0;
	return (index: number) => {
		return (index + 0.5) * barGroupWidth.value;
	};
});

// Color management - use parent color with gradients when drilling down
function getColor(key: string): string {
	const colors: Record<string, string> = CONFIG.color || {};
	const defaultColor = '#6c757d';

	// If we're at root level, use the item's own color
	if (path.value.length === 0) {
		return colors[colorKey(key)] || defaultColor;
	}

	// If we're deeper, use the first-level parent's color
	const parentKey = path.value[0];
	return parentKey ? colors[colorKey(parentKey)] || defaultColor : defaultColor;
}

// Get the max value among current children for calculating opacity gradient
const maxChildValue = computed(() => {
	let max = 0;
	for (const series of timeSeriesData.value) {
		for (const year of years.value) {
			const val = getDisplayValue(series, year);
			if (val > max) max = val;
		}
	}
	return max;
});

function bgColor(key: string, isHovered: boolean, isOther: boolean): string {
	const color = tinycolor(getColor(key));

	// Calculate base opacity based on value relative to siblings (when drilling down)
	let baseOpacity = 0.85;
	if (path.value.length > 0) {
		const series = timeSeriesData.value.find((s) => s.key === key);
		if (series && maxChildValue.value > 0) {
			// Keep opacity scaling consistent with active mode (regular/inflation/gdp)
			const values = years.value.map((year) => getDisplayValue(series, year));
			const avgValue =
				values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
			// Scale opacity from 0.4 to 1.0 based on value
			baseOpacity = 0.4 + 0.6 * (avgValue / maxChildValue.value);
		}
	}

	if (isOther && hovered.value !== null) {
		color.setAlpha(baseOpacity * 0.5);
	} else if (isHovered) {
		color.setAlpha(Math.min(1, baseOpacity + 0.15));
	} else {
		color.setAlpha(baseOpacity);
	}
	return color.toRgbString();
}

// Fill/stroke for the dotted parent-outline: lighter shade of the drilled item's color.
const parentOutlineFill = computed(() => {
	const parentKey = path.value[path.value.length - 1];
	if (!parentKey) return 'rgba(100, 100, 100, 0.08)';
	const c = tinycolor(getColor(parentKey));
	c.setAlpha(0.15);
	return c.toRgbString();
});
const parentOutlineStroke = computed(() => {
	const parentKey = path.value[path.value.length - 1];
	if (!parentKey) return '#666';
	return tinycolor(getColor(parentKey)).lighten(10).toRgbString();
});

function strokeColor(key: string, isHovered: boolean): string {
	const color = tinycolor(getColor(key));
	if (isHovered) {
		return color.darken(10).toRgbString();
	}
	return color.toRgbString();
}

// Y-axis ticks
const yTicks = computed(() => {
	const ticks: number[] = [];
	const max = maxValue.value;
	if (max <= 0) return ticks;
	const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
	if (step <= 0) return ticks;
	for (let i = 0; i <= max; i += step) {
		ticks.push(i);
	}
	return ticks;
});

// Format large numbers or percent
function formatValue(value: number): string {
	if (mode.value === 'gdp') {
		return value.toFixed(2).replace('.', ',') + ' %';
	}
	if (value >= 1e9) {
		return (value / 1e9).toFixed(1).replace('.', ',') + ' mrd';
	}
	if (value >= 1e6) {
		return (value / 1e6).toFixed(0) + ' M';
	}
	if (value >= 1e3) {
		return (value / 1e3).toFixed(0) + ' e';
	}
	return value.toString();
}

// Navigation
function drillDown(key: string) {
	// The clicked bar/legend item may be removed from the DOM on drill-down while
	// its tooltip is showing — clear any stray tip so it doesn't get stuck.
	window.$('.tooltip').remove();
	if (canDrillDown(key)) {
		path.value.push(key);
		hiddenSeries.value = new Set();
		return;
	}
	// No drillable children: filter to show only this item (or restore if already isolated)
	const allKeys = timeSeriesData.value.map((s) => s.key);
	if (allKeys.length <= 1) return;
	const otherKeys = allKeys.filter((k) => k !== key);
	const isIsolated =
		!hiddenSeries.value.has(key) && otherKeys.every((k) => hiddenSeries.value.has(k));
	hiddenSeries.value = isIsolated ? new Set() : new Set(otherKeys);
}

function canClick(key: string): boolean {
	return canDrillDown(key) || timeSeriesData.value.length > 1;
}

function navigateTo(index: number) {
	path.value = path.value.slice(0, index);
}

function canDrillDown(key: string): boolean {
	for (const year of years.value) {
		const node = getNodeForYear(year, [...path.value, key]);
		if (node?.children?.some(isVisibleChild)) return true;
	}
	return false;
}

// Calculate delta (change from previous year)
/**
 * Whether the series covers a year at all. A series that starts or ends
 * mid-chart — a chapter that was wound up, or one that split off from another —
 * has no figure for the rest, which is not the same as a figure of zero.
 */
function hasValue(series: Series, year: string): boolean {
	return series.values[year] !== undefined;
}

function getDelta(
	seriesKeyToFind: string,
	year: string,
	yearIndex: number,
): { value: number; percent: number | null } | null {
	if (yearIndex === 0) return null;
	const series = timeSeriesData.value.find((s) => s.key === seriesKeyToFind);
	if (!series) return null;
	const prevYear = years.value[yearIndex - 1];
	if (!prevYear) return null;
	// Nothing to compare against a year the item didn't exist in.
	if (!hasValue(series, year) || !hasValue(series, prevYear)) return null;
	const currentValue = getDisplayValue(series, year);
	const prevValue = getDisplayValue(series, prevYear);
	const delta = currentValue - prevValue;
	const percent = prevValue !== 0 ? (delta / prevValue) * 100 : null;
	return { value: delta, percent };
}

// Get the last (most recent) year for inflation label
const baseYear = computed(() => years.value[years.value.length - 1] || '');

function formatDelta(delta: { value: number; percent: number | null } | null): string {
	if (!delta) return '—';
	if (delta.percent === null) return '—';
	const sign = delta.percent >= 0 ? '+' : '';
	return `${sign}${delta.percent.toFixed(1).replace('.', ',')}%`;
}

function isDeltaPositive(key: string, year: string, yearIndex: number): boolean {
	const delta = getDelta(key, year, yearIndex);
	return !!delta && delta.value > 0;
}

function isDeltaNegative(key: string, year: string, yearIndex: number): boolean {
	const delta = getDelta(key, year, yearIndex);
	return !!delta && delta.value < 0;
}

const hoveredSeries = computed(() => {
	if (!hovered.value) return null;
	return timeSeriesData.value.find((s) => s.key === hovered.value) || null;
});

/**
 * Name the item carried in a given year. Items get renamed between years, so a
 * hovered bar has to show the name of that year, not the most recent one.
 */
function nameFor(series: Series, year: string): string {
	return series.names[year] || series.name;
}

/**
 * Tooltip of a bar segment. For a year where the item was reorganized, the
 * name alone is misleading — it is followed by the place it actually sits in
 * that year's budget.
 */
function segmentTooltip(series: Series, year: string): string {
	const name = nameFor(series, year);
	const move = series.moves[year];
	if (!move) return name;
	return `${name} — helye ebben az évben: ${move.path}`;
}

// Bootstrap caps tooltips at 200px, too narrow for a budget path. Widened via
// a per-element template, so the tooltips of the rest of the site stay as they are.
const PATH_TOOLTIP_TEMPLATE =
	'<div class="tooltip ts-path-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>';

// Details panel heading: the hovered year's name when hovering a bar, the most
// recent name when hovering the legend (which covers all years at once).
const hoveredName = computed(() => {
	const series = hoveredSeries.value;
	if (!series) return '';
	return hoveredYear.value ? nameFor(series, hoveredYear.value) : series.name;
});

// Top of a year's stack, so the ⚠ marker can sit right above the bar
function stackTop(year: string): number {
	let top = 0;
	for (const series of stackedData.value) {
		const y1 = series.stackedValues[year]?.y1 || 0;
		if (y1 > top) top = y1;
	}
	return top;
}

// Hatch pattern marking the uncertain (moved) bar segments. The ID has to be
// unique per instance, as several charts can share a page.
const hatchId = `ts-moved-hatch-${useId()}`;

const { regenerateTooltips, reinitTooltips } = useTooltips();

onMounted(regenerateTooltips);
onUpdated(regenerateTooltips);
watch(
	[() => view, () => side, mode, path, hiddenSeries, showOtherSections],
	() => nextTick(reinitTooltips),
	{ deep: true },
);
</script>

<template>
	<div class="time-series">
		<div
			v-if="years.length === 0"
			class="alert alert-info"
		>
			Nincs elérhető funkcionális adat ehhez a kategóriához.
		</div>

		<template v-else>
			<!-- Controls: Breadcrumb and Inflation toggle -->
			<div class="controls-wrapper">
				<!-- Breadcrumb navigation -->
				<nav aria-label="breadcrumb">
					<ol class="breadcrumb">
						<li
							v-for="(node, index) in nodePath"
							:key="index"
							class="breadcrumb-item"
							:class="{ active: index === nodePath.length - 1 }"
							@click="index < nodePath.length - 1 && navigateTo(index)"
						>
							{{ node.name }}
						</li>
					</ol>
				</nav>

				<!-- Mode chooser: regular, inflation, GDP -->
				<div
					v-if="inflationEnabled || gdpEnabled"
					class="mode-toggle"
				>
					<div
						class="btn-group btn-group-sm"
						role="group"
					>
						<button
							class="btn"
							:class="mode === 'regular' ? 'btn-primary' : 'btn-outline-secondary'"
							data-toggle="tooltip"
							title="Nominális értékek megjelenítése"
							@click="mode = 'regular'"
						>
							Nominál
						</button>
						<button
							v-if="inflationEnabled"
							class="btn"
							:class="mode === 'inflation' ? 'btn-primary' : 'btn-outline-secondary'"
							data-toggle="tooltip"
							title="Infláció korrigált értékek"
							@click="mode = 'inflation'"
						>
							Infláció korrigált
						</button>
						<button
							v-if="gdpEnabled"
							class="btn"
							:class="mode === 'gdp' ? 'btn-primary' : 'btn-outline-secondary'"
							data-toggle="tooltip"
							title="Értékek az éves GDP %-ában"
							@click="mode = 'gdp'"
						>
							GDP arány
						</button>
					</div>
				</div>

				<!-- Follow items into other chapters/titles by their AHT code -->
				<div
					v-if="ahtEnabled"
					class="mode-toggle other-sections-toggle"
				>
					<button
						class="btn btn-sm"
						:class="showOtherSections ? 'btn-primary' : 'btn-outline-secondary'"
						data-toggle="tooltip"
						:data-template="PATH_TOOLTIP_TEMPLATE"
						:title="
							showOtherSections
								? 'Az átszervezés miatt más fejezetbe vagy címbe került tételeket az AHT kódjuk alapján követi az ábra, és az összegük itt is megjelenik (sávozott mintával jelölve). Kattints, ha csak az itt szereplő tételeket szeretnéd látni.'
								: 'Az ábra csak az itt szereplő tételeket mutatja: ha egy tétel átszervezés miatt másik fejezetbe vagy címbe került, az idősora ott véget ér. Kattints a máshol szereplő tételek követéséhez.'
						"
						@click="showOtherSections = !showOtherSections"
					>
						<i
							class="fas fa-fw"
							:class="showOtherSections ? 'fa-eye' : 'fa-eye-slash'"
						/>
						Máshol szereplő tételek
					</button>
				</div>
			</div>

			<!-- Chart and Details wrapper -->
			<div class="chart-details-wrapper">
				<!-- SVG Chart -->
				<div class="chart-container">
					<svg
						:viewBox="`0 0 ${chartWidth} ${chartHeight}`"
						class="chart"
						preserveAspectRatio="xMidYMid meet"
					>
						<defs v-if="hasUncertainty">
							<!-- Marks the segments whose item was reorganized that year -->
							<pattern
								:id="hatchId"
								width="6"
								height="6"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)"
							>
								<line
									x1="0"
									y1="0"
									x2="0"
									y2="6"
									class="moved-hatch-line"
								/>
							</pattern>
						</defs>
						<g :transform="`translate(${padding.left}, ${padding.top})`">
							<!-- Y-axis grid lines -->
							<g class="grid">
								<line
									v-for="tick in yTicks"
									:key="tick"
									:x1="0"
									:x2="innerWidth"
									:y1="yScale(tick)"
									:y2="yScale(tick)"
									class="grid-line"
								/>
							</g>

							<!-- Y-axis labels -->
							<g class="y-axis">
								<text
									v-for="tick in yTicks"
									:key="tick"
									:x="-10"
									:y="yScale(tick)"
									class="axis-label"
									text-anchor="end"
									dominant-baseline="middle"
								>
									{{ formatValue(tick) }}
								</text>
							</g>

							<!-- X-axis labels (years) -->
							<g class="x-axis">
								<template
									v-for="(year, index) in years"
									:key="year"
								>
									<a
										v-if="!embedded"
										:href="yearHref(year)"
									>
										<text
											:x="xScale(index)"
											:y="innerHeight + 25"
											class="axis-label axis-label-link"
											:class="{
												'axis-label-muted': yearStates[year] === 'na',
											}"
											text-anchor="middle"
										>
											{{ year }}
										</text>
									</a>
									<text
										v-else
										:x="xScale(index)"
										:y="innerHeight + 25"
										class="axis-label"
										:class="{
											'axis-label-muted': yearStates[year] === 'na',
										}"
										text-anchor="middle"
									>
										{{ year }}
									</text>
								</template>
							</g>

							<!-- N/A indicator for years with no data at the drilled-into level -->
							<g class="na-markers">
								<template
									v-for="(year, yearIndex) in years"
									:key="'na-' + year"
								>
									<g
										v-if="yearStates[year] === 'na'"
										:transform="`translate(${xScale(yearIndex)}, ${innerHeight - 22})`"
										data-toggle="tooltip"
										title="Nincs megjeleníthető adat."
									>
										<circle
											r="16"
											class="na-circle"
										/>
										<text
											text-anchor="middle"
											dominant-baseline="central"
											class="na-text"
										>
											N/A
										</text>
									</g>
								</template>
							</g>

							<!-- Dotted outline of the parent bar (the item we drilled into) -->
							<g
								v-if="parentValues"
								class="parent-outlines"
							>
								<template
									v-for="(year, yearIndex) in years"
									:key="'outline-' + year"
								>
									<rect
										v-if="parentValues[year] !== undefined"
										:x="xScale(yearIndex) - barWidth / 2"
										:y="yScale(parentValues[year] || 0)"
										:width="barWidth"
										:height="innerHeight - yScale(parentValues[year] || 0)"
										:fill="parentOutlineFill"
										:stroke="parentOutlineStroke"
										class="parent-outline"
									/>
								</template>
							</g>

							<!-- Dotted outline of the full level total, including items hidden by kgrOnly -->
							<g
								v-if="levelTotalValues"
								class="level-total-outlines"
							>
								<template
									v-for="(year, yearIndex) in years"
									:key="'leveltotal-' + year"
								>
									<rect
										v-if="levelTotalValues[year] !== undefined"
										:x="xScale(yearIndex) - barWidth / 2"
										:y="yScale(levelTotalValues[year] || 0)"
										:width="barWidth"
										:height="innerHeight - yScale(levelTotalValues[year] || 0)"
										fill="none"
										:stroke="parentOutlineStroke"
										class="parent-outline level-total-outline"
										data-toggle="tooltip"
										title="A szint teljes összege (a szűrt tételekkel együtt)"
									/>
								</template>
							</g>

							<!-- Stacked bars for each year -->
							<g class="bars">
								<template
									v-for="(year, yearIndex) in years"
									:key="'year-' + year"
								>
									<rect
										v-for="series in stackedData"
										:key="'bar-' + series.key + '-' + year"
										:x="xScale(yearIndex) - barWidth / 2"
										:y="yScale(series.stackedValues[year]?.y1 || 0)"
										:width="barWidth"
										:height="
											yScale(series.stackedValues[year]?.y0 || 0) -
											yScale(series.stackedValues[year]?.y1 || 0)
										"
										:fill="
											bgColor(
												series.key,
												hovered === series.key,
												hovered !== null && hovered !== series.key,
											)
										"
										:stroke="strokeColor(series.key, hovered === series.key)"
										:stroke-width="hovered === series.key ? 2 : 1"
										class="bar"
										:class="{
											clickable: canClick(series.key),
										}"
										data-toggle="tooltip"
										:data-template="
											series.moves[year] ? PATH_TOOLTIP_TEMPLATE : undefined
										"
										:title="segmentTooltip(series, year)"
										@mouseenter="
											hovered = series.key;
											hoveredYear = year;
											hoverSide =
												yearIndex >= years.length / 2 ? 'right' : 'left';
										"
										@mouseleave="
											hovered = null;
											hoveredYear = null;
										"
										@click="drillDown(series.key)"
									/>
								</template>
							</g>

							<!-- Uncertainty hatching over the segments of moved items -->
							<g class="moved-overlays">
								<template
									v-for="(year, yearIndex) in years"
									:key="'moved-year-' + year"
								>
									<rect
										v-for="series in stackedData.filter((s) => s.moves[year])"
										:key="'moved-' + series.key + '-' + year"
										:x="xScale(yearIndex) - barWidth / 2"
										:y="yScale(series.stackedValues[year]?.y1 || 0)"
										:width="barWidth"
										:height="
											yScale(series.stackedValues[year]?.y0 || 0) -
											yScale(series.stackedValues[year]?.y1 || 0)
										"
										:fill="`url(#${hatchId})`"
										class="moved-overlay"
									/>
								</template>
							</g>

							<!--
								Items that moved a level deeper have no segment of their
								own — their value is inside another one. Hovering the item
								(here or in the legend) highlights where it sits.
							-->
							<g class="nested-bars">
								<template
									v-for="(year, yearIndex) in years"
									:key="'nested-year-' + year"
								>
									<template
										v-for="segment in nestedSegments[year] || []"
										:key="'nested-' + segment.key + '-' + year"
									>
										<template v-if="hovered === segment.key">
											<rect
												:x="xScale(yearIndex) - barWidth / 2"
												:y="yScale(segment.y1)"
												:width="barWidth"
												:height="
													Math.max(
														MIN_NESTED_HEIGHT,
														yScale(segment.y0) - yScale(segment.y1),
													)
												"
												:fill="bgColor(segment.key, true, false)"
												:stroke="strokeColor(segment.key, true)"
												class="bar nested-bar"
												:class="{ clickable: canClick(segment.key) }"
												data-toggle="tooltip"
												:data-template="PATH_TOOLTIP_TEMPLATE"
												:title="segment.title"
												@mouseenter="
													hovered = segment.key;
													hoveredYear = year;
													hoverSide =
														yearIndex >= years.length / 2
															? 'right'
															: 'left';
												"
												@mouseleave="
													hovered = null;
													hoveredYear = null;
												"
												@click="drillDown(segment.key)"
											/>
											<rect
												:x="xScale(yearIndex) - barWidth / 2"
												:y="yScale(segment.y1)"
												:width="barWidth"
												:height="
													Math.max(
														MIN_NESTED_HEIGHT,
														yScale(segment.y0) - yScale(segment.y1),
													)
												"
												:fill="`url(#${hatchId})`"
												class="moved-overlay"
											/>
										</template>
									</template>
								</template>
							</g>

							<!-- Warning marker above the bars of years affected by a move -->
							<g class="moved-markers">
								<template
									v-for="(year, yearIndex) in years"
									:key="'movedmark-' + year"
								>
									<text
										v-if="uncertainYears[year]"
										:x="xScale(yearIndex)"
										:y="Math.max(10, yScale(stackTop(year)) - 8)"
										class="moved-marker"
										text-anchor="middle"
										data-toggle="tooltip"
										:title="yearUncertaintyTooltip(year)"
									>
										&#9888;
									</text>
								</template>
							</g>
						</g>
					</svg>
				</div>

				<!-- Details panel showing current hovered item (desktop: right side) -->
				<div
					v-if="hoveredSeries"
					class="details-panel details-panel-desktop"
					:class="hoverSide === 'right' ? 'pos-left' : 'pos-right'"
				>
					<h5>{{ hoveredName }}</h5>
					<table class="table table-sm">
						<thead>
							<tr>
								<th>Év</th>
								<th class="text-right">
									Összeg
									<template v-if="mode === 'inflation'">
										({{ baseYear }})</template
									>
									<template v-if="mode === 'gdp'"> (% GDP)</template>
								</th>
								<th class="text-right">Változás</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="(year, index) in years"
								:key="year"
							>
								<td>
									{{ year }}
									<i
										v-if="isUncertain(hoveredSeries, year)"
										class="fas fa-exclamation-triangle moved-icon"
										data-toggle="tooltip"
										:data-template="PATH_TOOLTIP_TEMPLATE"
										:title="describeUncertainty(hoveredSeries, year, true)"
									/>
								</td>
								<td class="text-right">
									{{
										hasValue(hoveredSeries, year)
											? getStringValue(hoveredSeries, year)
											: '—'
									}}
								</td>
								<td
									class="text-right delta"
									:class="{
										positive: isDeltaPositive(hoveredSeries.key, year, index),
										negative: isDeltaNegative(hoveredSeries.key, year, index),
									}"
								>
									{{ formatDelta(getDelta(hoveredSeries.key, year, index)) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Legend -->
			<div
				class="legend"
				:class="{ 'is-embedded': embedded }"
			>
				<div
					v-for="series in timeSeriesData"
					:key="'legend-' + series.key"
					class="legend-item"
					:class="{
						highlighted: hovered === series.key,
						dimmed: hovered !== null && hovered !== series.key,
						clickable: canClick(series.key),
						hidden: hiddenSeries.has(series.key),
					}"
					@mouseenter="
						hovered = series.key;
						hoveredYear = null;
					"
					@mouseleave="hovered = null"
					@click="drillDown(series.key)"
				>
					<span
						class="legend-color"
						:style="{
							backgroundColor: bgColor(series.key, false, false),
						}"
					/>
					<span
						class="legend-label"
						:data-label="series.name"
						>{{ series.name }}</span
					>
					<i
						v-if="hasAnyUncertainty(series)"
						class="fas fa-fw fa-exclamation-triangle moved-icon ml-1"
						data-toggle="tooltip"
						:title="uncertaintyTooltip(series)"
					/>
					<i
						v-if="canDrillDown(series.key)"
						class="fas fa-fw fa-level-down-alt ml-1"
					/>
					<button
						class="toggle-visibility-btn"
						:class="{ 'is-hidden': hiddenSeries.has(series.key) }"
						data-toggle="tooltip"
						:title="hiddenSeries.has(series.key) ? 'Megjelenítés' : 'Elrejtés'"
						@click="toggleSeriesVisibility(series.key, $event)"
					>
						<i
							class="fas fa-fw"
							:class="hiddenSeries.has(series.key) ? 'fa-eye-slash' : 'fa-eye'"
						/>
					</button>
				</div>
			</div>

			<!-- Reorganization warning: some items are not in the same place every year -->
			<div
				v-if="hasUncertainty"
				class="moved-note"
			>
				<i class="fas fa-exclamation-triangle moved-icon mr-2" />
				<span>
					Néhány tétel átszervezés miatt nem minden évben ugyanott szerepel a
					költségvetésben. Ezeket az AHT azonosítójuk, illetve — ha az is megváltozott — a
					tartalmuk alapján követjük tovább, de az összehasonlításuk bizonytalan: a
					<i class="fas fa-exclamation-triangle moved-icon" />
					jellel és a sávozott mintával jelölt tételekre, illetve évekre mutatva
					olvasható, hogy hol szerepelnek az adott évben. Ha egy tétel abban az évben
					mélyebb szinten volt, nincs saját sávrésze — a tételre mutatva kiemeljük, hol
					van az összege a sávon belül.
				</span>
			</div>

			<!-- Details panel for mobile (below legend) -->
			<div
				v-if="hoveredSeries"
				class="details-panel details-panel-mobile"
			>
				<h5>{{ hoveredName }}</h5>
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Év</th>
							<th>Név</th>
							<th class="text-right">
								Összeg
								<template v-if="mode === 'inflation'"> ({{ baseYear }})</template>
								<template v-if="mode === 'gdp'"> (% GDP)</template>
							</th>
							<th class="text-right">Változás</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(year, index) in years"
							:key="year"
						>
							<td>
								{{ year }}
								<i
									v-if="isUncertain(hoveredSeries, year)"
									class="fas fa-exclamation-triangle moved-icon"
									data-toggle="tooltip"
									:data-template="PATH_TOOLTIP_TEMPLATE"
									:title="describeUncertainty(hoveredSeries, year, true)"
								/>
							</td>
							<td class="name-cell">
								{{ hoveredSeries.names[year] || '—' }}
							</td>
							<td class="text-right">
								{{
									hasValue(hoveredSeries, year)
										? getStringValue(hoveredSeries, year)
										: '—'
								}}
							</td>
							<td
								class="text-right delta"
								:class="{
									positive: isDeltaPositive(hoveredSeries.key, year, index),
									negative: isDeltaNegative(hoveredSeries.key, year, index),
								}"
							>
								{{ formatDelta(getDelta(hoveredSeries.key, year, index)) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

// Amber that stays readable on the white chart background
$moved-color: #b8860b;

.time-series {
	font-family: $vis-font-family;

	.controls-wrapper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;

		nav {
			flex: 1;
			min-width: 200px;
		}
	}

	.mode-toggle {
		.btn {
			white-space: nowrap;
			font-size: 0.85rem;
		}
	}

	.breadcrumb {
		background-color: transparent;
		padding-left: 0;
		margin-bottom: 0;

		.breadcrumb-item {
			text-align: left;

			&.active {
				color: $dark;
				font-weight: bold;
			}

			&:not(.active) {
				cursor: pointer;
				color: $text-muted;

				&:hover {
					color: $primary;
				}
			}
		}
	}

	.chart-details-wrapper {
		position: relative;
	}

	.chart-container {
		width: 100%;
		overflow-x: auto;

		.chart {
			width: 100%;
			min-width: 500px;
			height: auto;
			max-height: 500px;
		}
	}

	.grid-line {
		stroke: #e0e0e0;
		stroke-dasharray: 2, 2;
	}

	.axis-label {
		font-size: 12px;
		fill: #666;
	}

	.axis-label-muted {
		fill: #b5b5b5;
	}

	.axis-label-link {
		cursor: pointer;
		text-decoration: underline;
		text-decoration-style: dotted;
		text-decoration-color: rgba(102, 102, 102, 0.4);

		&:hover {
			fill: $primary;
			text-decoration-color: $primary;
		}
	}

	.parent-outline {
		stroke-width: 1;
		stroke-dasharray: 3, 3;
		pointer-events: none;
	}

	.level-total-outline {
		stroke-width: 1.5;
		stroke-dasharray: 4, 3;
		// Re-enable hovering so the tooltip explaining the line can show.
		pointer-events: stroke;
	}

	// Reorganization ("moved item") markers — see the AHT block in the script
	.moved-hatch-line {
		stroke: rgba(0, 0, 0, 0.3);
		stroke-width: 2;
	}

	.moved-overlay {
		// Must not swallow the hover of the bar underneath
		pointer-events: none;
	}

	// Highlight of an item that sits deeper in the tree, drawn over the segment
	// that holds its value — only visible while that item is hovered.
	.nested-bar {
		stroke-width: 2;
	}

	.moved-marker {
		font-size: 14px;
		fill: $moved-color;
		cursor: help;
	}

	.moved-icon {
		color: $moved-color;
		cursor: help;
	}

	.legend .moved-icon {
		font-size: 0.8rem;
	}

	.moved-note {
		display: flex;
		align-items: flex-start;
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-left: 3px solid $moved-color;
		border-radius: 0.25rem;
		background-color: rgba(184, 134, 11, 0.08);
		font-size: 0.8rem;
		color: $text-muted;
	}

	.na-circle {
		fill: #f1f3f5;
		stroke: #adb5bd;
		stroke-width: 1;
	}

	.na-text {
		font-size: 12px;
		fill: #6c757d;
		font-weight: 600;
		pointer-events: none;
	}

	.bar {
		transition: all 0.2s ease;

		&.clickable {
			cursor: pointer;
		}
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f8f9fa;
		border-radius: 0.25rem;

		.legend-item {
			display: flex;
			align-items: center;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
			transition: all 0.2s ease;
			user-select: none;

			&.clickable {
				cursor: pointer;
			}

			&.highlighted {
				background-color: rgba(0, 0, 0, 0.1);
				font-weight: bold;
			}

			&.dimmed {
				opacity: 0.5;
			}

			&.hidden {
				opacity: 0.5;

				.legend-color {
					background-color: #ccc !important;
				}

				.legend-label {
					text-decoration: line-through;
					color: #999;
				}
			}

			&:hover {
				background-color: rgba(0, 0, 0, 0.05);
			}
		}

		.toggle-visibility-btn {
			background: none;
			border: none;
			padding: 0.125rem 0.25rem;
			margin-left: 0.25rem;
			cursor: pointer;
			color: #666;
			font-size: 0.75rem;
			border-radius: 0.25rem;
			transition: all 0.2s ease;

			&:hover {
				background-color: rgba(0, 0, 0, 0.1);
				color: #333;
			}

			&.is-hidden {
				color: #999;
			}
		}

		.legend-color {
			width: 16px;
			height: 16px;
			border-radius: 2px;
			margin-right: 0.5rem;
			flex-shrink: 0;
		}

		.legend-label {
			font-size: 0.875rem;

			// Highlighting an item bolds it, which used to re-wrap the whole legend
			// under the cursor — losing the hover, and with it the highlight on the
			// chart. Reserving the bold width keeps the layout still.
			&::after {
				content: attr(data-label);
				display: block;
				height: 0;
				overflow: hidden;
				visibility: hidden;
				font-weight: bold;
			}
		}

		&.is-embedded .legend-label {
			font-size: 0.75rem;
		}
	}

	.details-panel {
		padding: 0.5rem 0.75rem;
		background-color: #fff;
		border: 1px solid #dee2e6;
		border-radius: 0.25rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		h5 {
			margin-bottom: 0.4rem;
			padding-bottom: 0.3rem;
			border-bottom: 1px solid #dee2e6;
			font-size: 0.85rem;
		}

		.table {
			margin-bottom: 0;
			font-size: 0.7rem;

			th,
			td {
				padding: 0.15rem 0.3rem;
			}

			.name-cell {
				max-width: 150px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.delta {
				font-size: 0.65rem;
				white-space: nowrap;

				&.positive {
					color: #28a745;
				}

				&.negative {
					color: #dc3545;
				}
			}
		}
	}

	// Desktop: details panel overlays the top-right corner of the chart so it never overflows the viewport
	.details-panel-desktop {
		display: none;

		@include media-breakpoint-up(lg) {
			display: block;
			position: absolute;
			top: 0;
			width: 330px;
			max-height: 350px;
			overflow-y: auto;
			z-index: 10;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

			&.pos-right {
				right: 0;
			}

			&.pos-left {
				left: 0;
			}
		}
	}

	// Mobile: details panel below
	.details-panel-mobile {
		margin-top: 1rem;

		@include media-breakpoint-up(lg) {
			display: none;
		}
	}
}

// Bootstrap tooltips are 200px wide — a budget path needs more room. The tooltip
// is appended to the body, so this rule can't live inside .time-series.
.tooltip.ts-path-tooltip .tooltip-inner {
	max-width: 340px;
	text-align: left;
}
</style>
