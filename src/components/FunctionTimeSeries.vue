<script setup lang="ts">
import tinycolor from 'tinycolor2';

const { side } = defineProps<{
	side: 'expense' | 'income';
}>();

const path = ref<string[]>([]);
const hovered = ref<string | null>(null);

// Get all years that have func data for this side
const years = computed(() => {
	return Object.keys(DATA)
		.filter((year) => DATA[year]?.[side]?.func)
		.sort();
});

// Get the root node for a specific year
function getRootForYear(year: string): BudgetNode | null {
	return DATA[year]?.[side]?.func || null;
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

// Get children of current node (consistent across years)
const currentChildren = computed(() => {
	// Get children from the first year that has data at this path
	for (const year of years.value) {
		const root = getRootForYear(year);
		const node = getNodeAtPath(root, path.value);
		if (node?.children && node.children.length > 0) {
			return node.children
				.filter((child) => !String(child.id).startsWith('F'))
				.sort((a, b) => b.value - a.value);
		}
	}
	return [];
});

// Build time series data for all children
const timeSeriesData = computed(() => {
	const result: Record<string, { id: string; name: string; values: Record<string, number> }> = {};

	for (const child of currentChildren.value) {
		const id = String(child.id);
		result[id] = {
			id,
			name: child.name,
			values: {},
		};
	}

	for (const year of years.value) {
		const root = getRootForYear(year);
		const node = getNodeAtPath(root, path.value);
		if (node?.children) {
			for (const child of node.children) {
				const id = String(child.id);
				if (result[id]) {
					result[id].values[year] = child.value;
				}
			}
		}
	}

	return Object.values(result);
});

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

// Calculate stacked data - cumulative values for each year
const stackedData = computed(() => {
	const result: {
		id: string;
		name: string;
		values: Record<string, number>;
		stackedValues: Record<string, { y0: number; y1: number }>;
	}[] = [];

	// Initialize with raw values
	for (const series of timeSeriesData.value) {
		result.push({
			...series,
			stackedValues: {},
		});
	}

	// Calculate stacked values for each year
	for (const year of years.value) {
		let cumulative = 0;
		for (const series of result) {
			const value = series.values[year] || 0;
			series.stackedValues[year] = {
				y0: cumulative,
				y1: cumulative + value,
			};
			cumulative += value;
		}
	}

	return result;
});

// Scale calculations - max is now total of all series
const maxValue = computed(() => {
	let max = 0;
	for (const year of years.value) {
		let total = 0;
		for (const series of timeSeriesData.value) {
			total += series.values[year] || 0;
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

const xScale = computed(() => {
	const count = years.value.length;
	if (count <= 1) return () => innerWidth / 2;
	return (index: number) => {
		return (index / (count - 1)) * innerWidth;
	};
});

// Generate stacked area path for a series
function generateStackedAreaPath(series: {
	stackedValues: Record<string, { y0: number; y1: number }>;
}): string {
	const topPoints: string[] = [];
	const bottomPoints: string[] = [];

	years.value.forEach((year, index) => {
		const x = xScale.value(index);
		const stacked = series.stackedValues[year] || { y0: 0, y1: 0 };
		const y1 = yScale.value(stacked.y1);
		const y0 = yScale.value(stacked.y0);

		topPoints.push(`${index === 0 ? 'M' : 'L'} ${x} ${y1}`);
		bottomPoints.unshift(`L ${x} ${y0}`);
	});

	return topPoints.join(' ') + ' ' + bottomPoints.join(' ') + ' Z';
}

// Generate top line path for a stacked series (for the stroke)
function generateStackedLinePath(series: {
	stackedValues: Record<string, { y0: number; y1: number }>;
}): string {
	const points: string[] = [];
	years.value.forEach((year, index) => {
		const x = xScale.value(index);
		const stacked = series.stackedValues[year] || { y0: 0, y1: 0 };
		const y = yScale.value(stacked.y1);
		points.push(`${index === 0 ? 'M' : 'L'} ${x} ${y}`);
	});
	return points.join(' ');
}

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
	return colors[parentId] || defaultColor;
}

// Get the max value among current children for calculating opacity gradient
const maxChildValue = computed(() => {
	let max = 0;
	for (const series of timeSeriesData.value) {
		for (const year of years.value) {
			const val = series.values[year] || 0;
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
			// Get average value across years for this series
			const values = Object.values(series.values);
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
	const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
	for (let i = 0; i <= max; i += step) {
		ticks.push(i);
	}
	return ticks;
});

// Format large numbers
function formatValue(value: number): string {
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
	const child = currentChildren.value.find((c) => String(c.id) === id);
	if (child?.children && child.children.length > 0) {
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
			return true;
		}
	}
	return false;
}
</script>

<template>
	<div class="function-time-series">
		<div
			class="alert alert-info"
			v-if="years.length === 0"
		>
			Nincs elérhető funkcionális adat ehhez a kategóriához.
		</div>

		<template v-else>
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

						<!-- Stacked area fills (rendered in reverse order so first is on top) -->
						<g class="areas">
							<path
								v-for="series in [...stackedData].reverse()"
								:key="'area-' + series.id"
								:d="generateStackedAreaPath(series)"
								:fill="bgColor(series.id, hovered === series.id, hovered !== null && hovered !== series.id)"
								class="area"
								:class="{ clickable: canDrillDown(series.id) }"
								@mouseenter="hovered = series.id"
								@mouseleave="hovered = null"
								@click="drillDown(series.id)"
							>
								<title>{{ series.name }}</title>
							</path>
						</g>

						<!-- Lines on top of stacked areas -->
						<g class="lines">
							<path
								v-for="series in stackedData"
								:key="'line-' + series.id"
								:d="generateStackedLinePath(series)"
								:stroke="strokeColor(series.id, hovered === series.id)"
								:stroke-width="hovered === series.id ? 3 : 1"
								fill="none"
								class="line"
								:class="{ highlighted: hovered === series.id, clickable: canDrillDown(series.id) }"
								@mouseenter="hovered = series.id"
								@mouseleave="hovered = null"
								@click="drillDown(series.id)"
							/>
						</g>

						<!-- Data points on the top line of each stacked area -->
						<g class="points">
							<template
								v-for="series in stackedData"
								:key="'points-' + series.id"
							>
								<circle
									v-for="(year, index) in years"
									:key="series.id + '-' + year"
									:cx="xScale(index)"
									:cy="yScale(series.stackedValues[year]?.y1 || 0)"
									:r="hovered === series.id ? 6 : 4"
									:fill="strokeColor(series.id, hovered === series.id)"
									class="point"
									:class="{ highlighted: hovered === series.id, clickable: canDrillDown(series.id) }"
									@mouseenter="hovered = series.id"
									@mouseleave="hovered = null"
									@click="drillDown(series.id)"
								>
									<title>{{ series.name }}: {{ groupNums(series.values[year] || 0) }} ({{ year }})</title>
								</circle>
							</template>
						</g>
					</g>
					</svg>
				</div>

				<!-- Details panel showing current hovered item (desktop: right side) -->
				<div
					v-if="hovered"
					class="details-panel details-panel-desktop"
				>
					<h5>{{ timeSeriesData.find((s) => s.id === hovered)?.name }}</h5>
					<table class="table table-sm">
						<thead>
							<tr>
								<th>Év</th>
								<th class="text-right">Összeg</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="year in years"
								:key="year"
							>
								<td>{{ year }}</td>
								<td class="text-right">
									{{ groupNums(timeSeriesData.find((s) => s.id === hovered)?.values[year] || 0) }}
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
					}"
					@mouseenter="hovered = series.id"
					@mouseleave="hovered = null"
					@click="drillDown(series.id)"
				>
					<span
						class="legend-color"
						:style="{ backgroundColor: bgColor(series.id, false, false) }"
					></span>
					<span class="legend-label">{{ series.name }}</span>
					<i
						v-if="canDrillDown(series.id)"
						class="fas fa-fw fa-level-down-alt ml-1"
					></i>
				</div>
			</div>

			<!-- Details panel for mobile (below legend) -->
			<div
				v-if="hovered"
				class="details-panel details-panel-mobile"
			>
				<h5>{{ timeSeriesData.find((s) => s.id === hovered)?.name }}</h5>
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Év</th>
							<th class="text-right">Összeg</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="year in years"
							:key="year"
						>
							<td>{{ year }}</td>
							<td class="text-right">
								{{ groupNums(timeSeriesData.find((s) => s.id === hovered)?.values[year] || 0) }}
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

.function-time-series {
	font-family: $vis-font-family;

	.breadcrumb {
		background-color: transparent;
		padding-left: 0;

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

	.area {
		transition: opacity 0.2s ease;
		opacity: 0.5;

		&.clickable {
			cursor: pointer;
		}

		&:hover {
			opacity: 0.7;
		}
	}

	.line {
		transition: stroke-width 0.2s ease;

		&.clickable {
			cursor: pointer;
		}

		&.highlighted {
			stroke-width: 3;
		}
	}

	.point {
		transition: r 0.2s ease;

		&.clickable {
			cursor: pointer;
		}

		&.highlighted {
			r: 6;
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

			&:hover {
				background-color: rgba(0, 0, 0, 0.05);
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
		padding: 1rem;
		background-color: #fff;
		border: 1px solid #dee2e6;
		border-radius: 0.25rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		h5 {
			margin-bottom: 0.75rem;
			padding-bottom: 0.5rem;
			border-bottom: 1px solid #dee2e6;
			font-size: 1rem;
		}

		.table {
			margin-bottom: 0;
			font-size: 0.875rem;

			th,
			td {
				padding: 0.35rem 0.5rem;
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
			right: -290px;
			width: 270px;
			max-height: 400px;
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
