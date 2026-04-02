<script setup lang="ts">
import tinycolor from 'tinycolor2';

const { side, view = 'func' } = defineProps<{
	side: 'expense' | 'income';
	view?: 'func' | 'econ';
}>();

const path = ref<string[]>([]);
const hovered = ref<string | null>(null);
const hiddenSeries = ref<Set<string>>(new Set());
// mode: 'regular' | 'inflation' | 'gdp'
const mode = ref<'regular' | 'inflation' | 'gdp'>('regular');

// Reset path when view changes
watch(() => view, () => {
	path.value = [];
	hovered.value = null;
	hiddenSeries.value = new Set();
});

// Toggle series visibility
function toggleSeriesVisibility(id: string, event: Event) {
	event.stopPropagation();
	const newSet = new Set(hiddenSeries.value);
	if (newSet.has(id)) {
		newSet.delete(id);
	} else {
		newSet.add(id);
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

// Calculate cumulative inflation multipliers for each year (base = last/most recent year)
// Uses ALL inflation years from config (sorted), not just data years, to handle gaps correctly
const inflationMultipliers = computed(() => {
	const multipliers: Record<string, number> = {};
	const rates = inflationRates.value;
	
	if (years.value.length === 0) return multipliers;
	
	const firstYear = years.value[0]!;
	const lastYear = years.value[years.value.length - 1]!;
	
	// Last data year is base (multiplier = 1)
	multipliers[lastYear] = 1;
	
	// Collect all inflation years between first and last data year (inclusive start, exclusive end)
	// This accounts for skipped data years whose inflation still compounds
	const allInflationYears = Object.keys(rates)
		.filter(y => y >= firstYear && y < lastYear)
		.sort();
	
	// Calculate cumulative multipliers working backwards through ALL intermediate years
	let cumulative = 1;
	for (let i = allInflationYears.length - 1; i >= 0; i--) {
		const y = allInflationYears[i]!;
		const rate = rates[y] || 0;
		cumulative *= (1 + rate / 100);
		// Only store multiplier for years that have data
		if (years.value.includes(y)) {
			multipliers[y] = cumulative;
		}
	}
	
	return multipliers;
});

// Get all years that have data for this side and view
const years = computed(() => {
	// Parse allowed years from config (comma-separated string)
	const allowedYears = CONFIG.timeseries?.years
		? CONFIG.timeseries.years.split(',').map((y: string) => y.trim())
		: null;
	const gdp = gdpValues.value;

	return Object.keys(DATA)
		.filter((year) => DATA[year]?.[side]?.[view])
		.filter((year) => !allowedYears || allowedYears.includes(year))
		.filter((year) => mode.value !== 'gdp' || (typeof gdp[year] === 'number' && gdp[year] > 0))
		.sort();
});

// Get the root node for a specific year
function getRootForYear(year: string): BudgetNode | null {
	return DATA[year]?.[side]?.[view] || null;
}

// Navigate to a node following the current path
function getNodeAtPath(root: BudgetNode | null, nodePath: string[]): BudgetNode | null {
	if (!root) return null;
	let current = root;
	for (const id of nodePath) {
		const child = current.children?.find((c) => String(c.id) === id);
		if (!child) return null;
		current = child;
	}
	return current;
}

// Parse allowed IDs for time series filtering from config (kgr sheet)
const kgrFilter = computed(() => {
	if (!CONFIG.timeseries?.kgr) return null;
	const ids = (CONFIG.timeseries.kgr as string).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
	return ids.length > 0 ? new Set(ids) : null;
});

// Get children of current node (consistent across years)
const currentChildren = computed(() => {
	// Get children from the first year that has data at this path
	for (const year of years.value) {
		const root = getRootForYear(year);
		const node = getNodeAtPath(root, path.value);
		if (node?.children && node.children.length > 0) {
			return node.children
				.filter((child) => !String(child.id).startsWith('F'))
				.filter((child) => view !== 'econ' || !kgrFilter.value || kgrFilter.value.has(String(child.id)))
				.sort((a, b) => b.value - a.value);
		} else {
			return node ? [node] : [];
		}
	}
	return [];
});

// Build time series data for all children
const timeSeriesData = computed(() => {
	const result: Record<string, { id: string; name: string; values: Record<string, number>; adjustedValues: Record<string, number>; names: Record<string, string> }> = {};

	for (const child of currentChildren.value) {
		const id = String(child.id);
		result[id] = {
			id,
			name: child.name,
			values: {},
			adjustedValues: {},
			names: {},
		};
	}

	for (const year of years.value) {
		const root = getRootForYear(year);
		const node = getNodeAtPath(root, path.value);
		const multiplier = inflationMultipliers.value[year] || 1;
		if (node?.children) {
			for (const child of node.children) {
				const id = String(child.id);
				if (result[id]) {
					result[id]!.values[year] = child.value;
					result[id]!.adjustedValues[year] = child.value * multiplier;
					result[id]!.names[year] = child.name;
				}
			}
		}
	}

	return Object.values(result);
});

// Helper to get display value (raw, inflation-adjusted, or GDP-adjusted)
function getDisplayValue(series: { values: Record<string, number>; adjustedValues: Record<string, number> }, year: string): number {
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
function getStringValue(series: { values: Record<string, number>; adjustedValues: Record<string, number> }, year: string): string {
	if (mode.value === 'inflation' && inflationEnabled.value) {
		return groupNums(series.adjustedValues[year] || 0);
	}
	if (mode.value === 'gdp' && gdpEnabled.value) {
		const gdp = gdpValues.value[year];
		if (gdp && gdp > 0) {
			// Show as percentage of GDP
			return ((series.values[year] || 0) / gdp * 100).toFixed(2) + ' %';
		}
		return '0 %';
	}
	return groupNums(series.values[year] || 0);
}


// Get current node name for breadcrumb
const nodePath = computed(() => {
	const result: { id: string; name: string }[] = [{ id: '', name: 'Összesen' }];

	for (const year of years.value) {
		const root = getRootForYear(year);
		if (!root) continue;

		let current = root;
		for (let i = 0; i < path.value.length; i++) {
			const id = path.value[i];
			const child = current.children?.find((c) => String(c.id) === id);
			if (child) {
				if (result.length <= i + 1) {
					result.push({ id: String(child.id), name: child.name });
				}
				current = child;
			}
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

// Calculate stacked data - cumulative values for each year (excluding hidden series)
const stackedData = computed(() => {
	const result: {
		id: string;
		name: string;
		values: Record<string, number>;
		adjustedValues: Record<string, number>;
		stackedValues: Record<string, { y0: number; y1: number }>;
	}[] = [];

	// Initialize with raw values (only non-hidden series)
	for (const series of timeSeriesData.value) {
		if (hiddenSeries.value.has(series.id)) continue;
		result.push({
			...series,
			stackedValues: {},
		});
	}

	// Calculate stacked values for each year
	for (const year of years.value) {
		let cumulative = 0;
		for (const series of result) {
			const value = getDisplayValue(series, year);
			series.stackedValues[year] = {
				y0: cumulative,
				y1: cumulative + value,
			};
			cumulative += value;
		}
	}

	return result;
});

// Scale calculations - max is now total of all visible series
const maxValue = computed(() => {
	let max = 0;
	for (const year of years.value) {
		let total = 0;
		for (const series of timeSeriesData.value) {
			if (hiddenSeries.value.has(series.id)) continue;
			total += getDisplayValue(series, year);
		}
		if (total > max) max = total;
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
function getColor(id: string): string {
	const colors: Record<string, string> = CONFIG.color || {};
	const defaultColor = '#6c757d';

	// If we're at root level, use the item's own color
	if (path.value.length === 0) {
		return colors[id] || defaultColor;
	}

	// If we're deeper, use the first-level parent's color
	const parentId = path.value[0];
	return parentId ? colors[parentId] || defaultColor : defaultColor;
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

function bgColor(id: string, isHovered: boolean, isOther: boolean): string {
	const color = tinycolor(getColor(id));

	// Calculate base opacity based on value relative to siblings (when drilling down)
	let baseOpacity = 0.85;
	if (path.value.length > 0) {
		const series = timeSeriesData.value.find((s) => s.id === id);
		if (series && maxChildValue.value > 0) {
			// Keep opacity scaling consistent with active mode (regular/inflation/gdp)
			const values = years.value.map((year) => getDisplayValue(series, year));
			const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
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

function strokeColor(id: string, isHovered: boolean): string {
	const color = tinycolor(getColor(id));
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
		return value.toFixed(2) + ' %';
	}
	if (value >= 1e9) {
		return (value / 1e9).toFixed(1) + ' mrd';
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
function drillDown(id: string) {
	if (canDrillDown(id)) {
		path.value.push(id);
	}
}

function navigateTo(index: number) {
	path.value = path.value.slice(0, index);
}

function canDrillDown(id: string): boolean {
	for (const year of years.value) {
		const root = getRootForYear(year);
		const node = getNodeAtPath(root, [...path.value, id]);
		if (node?.children && node.children.length > 0) {
			const filtered = node.children
				.filter((child) => !String(child.id).startsWith('F'))
				.filter((child) => view !== 'econ' || !kgrFilter.value || kgrFilter.value.has(String(child.id)));
			if (filtered.length > 0) {
				return true;
			}
		}
	}
	return false;
}

// Calculate delta (change from previous year)
function getDelta(seriesId: string, year: string, yearIndex: number): { value: number; percent: number | null } | null {
	if (yearIndex === 0) return null;
	const series = timeSeriesData.value.find((s) => s.id === seriesId);
	if (!series) return null;
	const currentValue = getDisplayValue(series, year);
	const prevYear = years.value[yearIndex - 1];
	if (!prevYear) return null;
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
	return `${sign}${delta.percent.toFixed(1)}%`;
}

function isDeltaPositive(seriesId: string, year: string, yearIndex: number): boolean {
	const delta = getDelta(seriesId, year, yearIndex);
	return !!delta && delta.value > 0;
}

function isDeltaNegative(seriesId: string, year: string, yearIndex: number): boolean {
	const delta = getDelta(seriesId, year, yearIndex);
	return !!delta && delta.value < 0;
}

const hoveredSeries = computed(() => {
	if (!hovered.value) return null;
	return timeSeriesData.value.find((s) => s.id === hovered.value) || null;
});
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
				<div v-if="inflationEnabled || gdpEnabled" class="mode-toggle">
					<div class="btn-group btn-group-sm" role="group">
						<button
							class="btn"
							:class="mode === 'regular' ? 'btn-primary' : 'btn-outline-secondary'"
							title="Nominális értékek megjelenítése"
							@click="mode = 'regular'"
						>
							Nominál
						</button>
						<button
							v-if="inflationEnabled"
							class="btn"
							:class="mode === 'inflation' ? 'btn-primary' : 'btn-outline-secondary'"
							title="Infláció korrigált értékek"
							@click="mode = 'inflation'"
						>
							Infláció korrigált
						</button>
						<button
							v-if="gdpEnabled"
							class="btn"
							:class="mode === 'gdp' ? 'btn-primary' : 'btn-outline-secondary'"
							title="Értékek az éves GDP %-ában"
							@click="mode = 'gdp'"
						>
							GDP arány
						</button>
					</div>
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
							<text
								v-for="(year, index) in years"
								:key="year"
								:x="xScale(index)"
								:y="innerHeight + 25"
								class="axis-label"
								text-anchor="middle"
							>
								{{ year }}
							</text>
						</g>

						<!-- Stacked bars for each year -->
						<g class="bars">
							<template
								v-for="(year, yearIndex) in years"
								:key="'year-' + year"
							>
								<rect
									v-for="series in stackedData"
									:key="'bar-' + series.id + '-' + year"
									:x="xScale(yearIndex) - barWidth / 2"
									:y="yScale(series.stackedValues[year]?.y1 || 0)"
									:width="barWidth"
									:height="yScale(series.stackedValues[year]?.y0 || 0) - yScale(series.stackedValues[year]?.y1 || 0)"
									:fill="bgColor(series.id, hovered === series.id, hovered !== null && hovered !== series.id)"
									:stroke="strokeColor(series.id, hovered === series.id)"
									:stroke-width="hovered === series.id ? 2 : 1"
									class="bar"
									:class="{ clickable: canDrillDown(series.id) }"
									@mouseenter="hovered = series.id"
									@mouseleave="hovered = null"
									@click="drillDown(series.id)"
								>
									<title>{{ series.name }}: {{ groupNums(getDisplayValue(series, year)) }}
										<template v-if="mode === 'inflation'"> ({{ baseYear }}-es árszinten)</template>
										<template v-if="mode === 'gdp'"> (% GDP)</template>
										({{ year }})
									</title>
								</rect>
							</template>
						</g>
					</g>
					</svg>
				</div>

				<!-- Details panel showing current hovered item (desktop: right side) -->
				<div
					v-if="hoveredSeries"
					class="details-panel details-panel-desktop"
				>
					<h5>{{ hoveredSeries.name }}</h5>
					<table class="table table-sm">
						<thead>
							<tr>
								<th>Év</th>
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
								<td>{{ year }}</td>
								<td class="text-right">
									{{ getStringValue(hoveredSeries, year) }}
								</td>
								<td class="text-right delta" :class="{ positive: isDeltaPositive(hoveredSeries.id, year, index), negative: isDeltaNegative(hoveredSeries.id, year, index) }">
									{{ formatDelta(getDelta(hoveredSeries.id, year, index)) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Legend -->
			<div class="legend">
				<div
					v-for="series in timeSeriesData"
					:key="'legend-' + series.id"
					class="legend-item"
					:class="{
						highlighted: hovered === series.id,
						dimmed: hovered !== null && hovered !== series.id,
						clickable: canDrillDown(series.id),
						hidden: hiddenSeries.has(series.id),
					}"
					@mouseenter="hovered = series.id"
					@mouseleave="hovered = null"
					@click="drillDown(series.id)"
				>
					<span
						class="legend-color"
						:style="{ backgroundColor: bgColor(series.id, false, false) }"
					/>
					<span class="legend-label">{{ series.name }}</span>
					<i
						v-if="canDrillDown(series.id)"
						class="fas fa-fw fa-level-down-alt ml-1"
					/>
					<button
						class="toggle-visibility-btn"
						:class="{ 'is-hidden': hiddenSeries.has(series.id) }"
						:title="hiddenSeries.has(series.id) ? 'Megjelenítés' : 'Elrejtés'"
						@click="toggleSeriesVisibility(series.id, $event)"
					>
						<i class="fas fa-fw" :class="hiddenSeries.has(series.id) ? 'fa-eye-slash' : 'fa-eye'"/>
					</button>
				</div>
			</div>

			<!-- Details panel for mobile (below legend) -->
			<div
				v-if="hoveredSeries"
				class="details-panel details-panel-mobile"
			>
				<h5>{{ hoveredSeries.name }}</h5>
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
							<td>{{ year }}</td>
							<td class="name-cell">{{ hoveredSeries.names[year] || '—' }}</td>
							<td class="text-right">
								{{ getStringValue(hoveredSeries, year) }}
							</td>
							<td class="text-right delta" :class="{ positive: isDeltaPositive(hoveredSeries.id, year, index), negative: isDeltaNegative(hoveredSeries.id, year, index) }">
								{{ formatDelta(getDelta(hoveredSeries.id, year, index)) }}
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

	// Desktop: details panel floating on the right side
	.details-panel-desktop {
		display: none;

		@include media-breakpoint-up(lg) {
			display: block;
			position: absolute;
			top: 0;
			right: -350px;
			width: 330px;
			max-height: 350px;
			overflow-y: auto;
			z-index: 10;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>
