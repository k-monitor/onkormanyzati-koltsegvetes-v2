<script setup lang="ts">
import tinycolor from 'tinycolor2';
import config from '~/data/config.json';
import dataJson from '~/data/data.json';
import milestonesJson from '~/data/milestones.json';
import $tooltips from '~/data/tooltips.json';

const $data = dataJson as BudgetData;

const { defaultMode, year, side } = defineProps<{
	defaultMode: number;
	year: string;
	side: 'expense' | 'income';
}>();

const curves = ref<string[]>([]);
const hovered = ref(-1);
const loading = ref(true);
const mode = ref(0); // 0 = econ, 1 = func
const path = ref<string[]>([]);
let resizeTimeout: number | undefined = undefined;

const children = computed(() => {
	try {
		return (node.value?.children || [])
			.filter((node) => !String(node.id).startsWith('F'))
			.sort((a, b) => b.value - a.value);
	} catch (e) {
		return [];
	}
});

const data = computed(() => $data[year]?.[side] || { econ: null, func: null });

const root = computed(() => {
	return (
		(mode.value % 2 == 0 ? data.value.econ : data.value.func) || {
			name: '',
			value: 0,
			children: [],
		}
	);
});

const nodePath = computed(() => {
	var r = root.value;
	var np = [r];
	for (var p = 0; p < path.value.length; p++) {
		var id = path.value[p];
		var c = (r.children || []).filter((n) => n.id == id)[0];
		if (c && (c.children || []).length > 0) {
			r = c;
			np.push(r);
		} else {
			break;
		}
	}
	return np;
});

const node = computed(() => nodePath.value[nodePath.value.length - 1]);

const tooltips = computed(() => ($tooltips as Record<string, Record<string, string>>)[year] || {});

const type = computed(() => (mode.value % 2 == 0 ? 'econ' : 'func'));

watch(node, async () => {
	// TODO LATER eliminate jQuery
	window.$('.nav-pills .nav-link').blur();
	await nextTick();
	updateCurves();
});

watch(
	() => year,
	() => {
		if (!data.value.func && mode.value != 0) {
			mode.value = 0;
			path.value = [];
		}
	},
);

const wrapper = useTemplateRef('wrapper');
function autoScroll() {
	document.querySelector('.tooltip')?.remove();
	if (wrapper.value) scrollToElement(wrapper.value, 75);
}

function bgColor(node: BudgetNode | undefined, index: number) {
	const defaultColor = '#6c757d';
	if (!node) return defaultColor;

	const id = nodePath.value.length > 1 ? nodePath.value[1]!.id : node.id;
	const colors: Record<string, string> = config.color || {};
	const color = tinycolor(colors[String(id)] || defaultColor);
	if (nodePath.value.length > 1) {
		const opacity = 0.5 + 0.5 * (node.value / nodePath.value[1]!.value);
		color.setAlpha(opacity);
	}
	if (hovered.value > -1 && index != hovered.value && index > -1) {
		color.setAlpha(color.getAlpha() * 0.5);
	}
	return color.toRgbString();
}

function fgColor(node: BudgetNode | undefined, index: number) {
	var color = tinycolor(bgColor(node, index));
	return color.isLight() || color.getAlpha() < 0.5 ? 'black' : 'white';
}

const vis = useTemplateRef('vis');
function curve(index: number) {
	// TODO LATER eliminate jQuery
	const $ = window.$;
	try {
		var bars = vis.value;
		var barsTop = $(bars).offset().top;

		var bar = $(`.bar[data-index=${index}]`, bars);
		var barHeight = $(bar).outerHeight();
		var barTop = $(bar).offset().top - barsTop;
		var barMiddle = barTop + barHeight / 2;

		var label = $(`.label[data-index=${index}]`, bars);
		var labelHeight = $(label).outerHeight();
		var labelTop = $(label).offset().top - barsTop;
		var labelMiddle = labelTop + labelHeight / 2;

		var svg = $('.curves svg', bars);
		var svgWidth = $(svg).outerWidth();

		var x1 = 0;
		var y1 = barMiddle;
		var x2 = svgWidth;
		var y2 = labelMiddle; //self.labelY(node, index).slice(0, -1);
		var cx1 = svgWidth * 0.2;
		var cx2 = svgWidth * 0.8;
		var m = x1 + ',' + y1;
		var c1 = cx1 + ',' + y1;
		var c2 = cx2 + ',' + y2;
		var e = x2 + ',' + y2;
		return ['M' + m, 'C' + c1, c2, e].join(' ');
	} catch (e) {
		return '';
	}
}

function down(node: BudgetNode, index: number) {
	window.$('.tooltip').remove();
	if (node.children && node.children.length > 0) {
		path.value.push(String(node.id));
	}
}

function up(n?: number) {
	n = Math.max(n || 1, 0);
	while (n > 0) {
		path.value.pop();
		n--;
	}
}

function updateCurves() {
	if (!vis.value) return;
	const svg = vis.value.querySelector('.curves svg');
	if (svg) {
		var svgHeight = svg.getBoundingClientRect().height;
		var svgWidth = svg.getBoundingClientRect().width;
		svg.setAttribute('viewBox', [0, 0, svgWidth, svgHeight].join(' '));
	}
	curves.value = children.value.map((n, i) => curve(i));
}

function regenerateTooltips() {
	window.$('[data-toggle="tooltip"]').tooltip();
}

function milestoneId(node: BudgetNode) {
	try {
		const mid = (milestonesJson as Milestones).rels[year]?.[String(node.id)];
		return mid ? mid : null;
	} catch (e) {
		return null;
	}
}

onMounted(() => {
	if (data.value.func && defaultMode == 1) mode.value = 1;

	regenerateTooltips();
	updateCurves();
	window.addEventListener('resize', function () {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function () {
			updateCurves();
		}, 100);
	});

	eventBus.on('jump', (target) => {
		console.log('ON jump', target);
		if (target.side == side) {
			mode.value = target.type == 'econ' ? 0 : 1;
			path.value = [];
			(target.path || []).forEach((id) => {
				for (let i = 0; i < children.value.length; i++) {
					const node = children.value[i];
					if (node?.id == id && node.children && node.children.length > 0) {
						path.value.push(id);
					}
				}
			});
			nextTick(autoScroll);
		}
	});
});

onUpdated(regenerateTooltips);
</script>

<template>
	<div
		class="visualization"
		ref="wrapper"
	>
		<div class="row justify-content-center">
			<div
				class="col-lg-8 text-center"
				v-if="data.econ && data.func"
			>
				<ul class="justify-content-center mb-5 nav nav-pills w-100">
					<li class="nav-item">
						<a
							:class="{ active: mode == 1 }"
							:title="config.vis.funcHint"
							@click="
								path = [];
								mode = 1;
							"
							class="nav-link"
							data-placement="bottom"
							data-toggle="tooltip"
							href="javascript:void(0)"
						>
							{{ config.vis.func }}
						</a>
					</li>
					<li class="nav-item">
						<a
							:class="{ active: mode == 0 }"
							:title="config.vis.econHint"
							@click="
								path = [];
								mode = 0;
							"
							class="nav-link"
							data-placement="bottom"
							data-toggle="tooltip"
							href="javascript:void(0)"
						>
							{{ config.vis.econ }}
						</a>
					</li>
				</ul>
			</div>
		</div>

		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li
					class="breadcrumb-item"
					v-for="(n, i) in nodePath"
					:key="i"
					:class="{ active: i == nodePath.length - 1 }"
					@click="up(path.length - i)"
				>
					{{ n.name }}
				</li>
				<div class="ml-auto subtotal">{{ groupNums(node?.value || 0) }}</div>
			</ol>
		</nav>

		<div
			class="d-flex border-top border-bottom vis"
			ref="vis"
			@mouseout="hovered = -1"
		>
			<div class="d-flex left-column">
				<div
					class="back-bar d-flex justify-content-center"
					v-if="path.length > 0"
					@click="
						up();
						autoScroll();
					"
					:style="{ backgroundColor: bgColor(node, -1), color: fgColor(node, -1) }"
				>
					<i class="fas fa-fw fa-level-up-alt mx-2 my-auto"></i>
				</div>
				<div class="d-flex flex-column flex-grow-1">
					<div
						class="bar"
						v-for="(n, i) in children"
						:key="n.id"
						:data-id="n.id"
						:data-index="i"
						:style="{
							backgroundColor: bgColor(n, i),
							color: fgColor(n, i),
							flexGrow: n.value,
						}"
						@click="
							down(n, i);
							autoScroll();
						"
						@mouseover="hovered = i"
						data-toggle="tooltip"
						data-placement="left"
						:title="tooltips[String(n.id)]"
						oncontextmenu="return false;"
					>
						<div class="text-right w-100">
							<span class="d-inline d-sm-none font-weight-bold">{{
								groupNums(n.value, true)
							}}</span>
							<span class="d-none d-sm-inline">{{ groupNums(n.value) }}</span>
							<span class="d-none d-md-inline ml-1"
								>({{ Math.round((n.value / (node?.value || 1)) * 100) }}%)</span
							>
							<span class="d-sm-none"><br />{{ n.name }}</span>
							<i
								class="fas fa-fw fa-level-down-alt ml-1"
								v-if="n.children && n.children.length"
							></i>
						</div>
						<div class="d-flex d-sm-none">
							<div
								class="btn btn-link bg-light milestone-button ml-3 mr-1 px-2"
								@click="eventBus.emit('ms', milestoneId(n) || '')"
								v-if="config.modules.milestones && milestoneId(n)"
							>
								<i class="fas fa-fw fa-camera"></i>
							</div>
							<div
								class="btn btn-link ml-3 mr-1 px-2"
								:style="{ color: fgColor(n, i) }"
								v-else-if="tooltips[String(n.id)]"
							>
								<sub class="fas fa-fw fa-info"></sub>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="d-none d-sm-block middle-column curves">
				<svg
					height="100%"
					width="100%"
				>
					<path
						class="curve"
						v-for="(n, i) in children"
						:d="curves[i]"
						:key="n.id"
						:style="{ stroke: bgColor(n, i) }"
						vector-effect="non-scaling-stroke"
					></path>
				</svg>
			</div>
			<div class="d-none d-sm-flex flex-column justify-content-around right-column text-left">
				<div
					class="label"
					v-for="(n, i) in children"
					:class="{ 'text-muted': hovered > -1 && i != hovered }"
					:data-id="n.id"
					:data-index="i"
					:key="n.id"
					@mouseover="hovered = i"
					oncontextmenu="return false;"
				>
					<span
						@click="
							down(n, i);
							autoScroll();
						"
						>{{ n.name }}</span
					>
					<span
						class="btn btn-link milestone-button ml-auto"
						@click="eventBus.emit('ms', milestoneId(n) || '')"
						v-if="config.modules.milestones && milestoneId(n)"
						><i class="fas fa-camera"></i
					></span>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

.visualization {
	font-family: $vis-font-family;

	.left-column {
		width: 35%;

		@include media-breakpoint-down(xs) {
			width: 100%;
		}
	}
	.middle-column {
		width: 5%;
	}
	.right-column {
		width: 60%;
	}

	@include media-breakpoint-up(md) {
		.left-column {
			width: 45%;
		}
		.middle-column {
			width: 10%;
		}
		.right-column {
			width: 45%;
		}
	}

	.bar,
	.label {
		align-items: center;
		display: flex;
		margin-bottom: 1px;
		min-height: 64px; // iOS fix
		padding: 0.25rem 0.25rem;
		@include media-breakpoint-up(sm) {
			min-height: 24px;
			padding: 0.1rem;
		}
		@include media-breakpoint-up(md) {
			padding: 0.1rem 0.5rem;
		}
		user-select: none;
	}

	.back-bar {
		cursor: pointer;
		margin-right: 1px;

		&:hover {
			opacity: 0.8;
		}
	}

	.breadcrumb-item {
		text-align: left;
	}

	.breadcrumb-item.active,
	.breadcrumb .subtotal {
		color: $dark;
		font-weight: bold;
	}

	.breadcrumb-item:not(.active) {
		&:not(:hover) {
			color: $text-muted;
		}
		cursor: pointer;
	}

	.curve {
		fill: none;
	}

	.label {
		text-align: left;
	}

	svg {
		height: 100%;
		width: 100%;
	}

	.vis-header {
		font-weight: bold;
	}

	.vis {
		@include media-breakpoint-up(sm) {
			height: 75vh;
			min-height: 400px;
		}
		font-size: 90%;

		& > div {
			height: 100%;
		}

		.bar,
		.label span {
			cursor: pointer;
		}
	}
}
</style>
