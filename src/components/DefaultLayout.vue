<script setup lang="ts">
const { canShowMilestones, canShowMap, year } = useYear();
const { setNavigationScroll, sectionToElementId } = useScrollspy();

// Whether func/econ views are enabled for timeseries (default: both enabled)
const timeseriesFuncEnabled = computed(() => CONFIG.timeseries?.func == null || !!CONFIG.timeseries.func);
const timeseriesEconEnabled = computed(() => CONFIG.timeseries?.econ == null || !!CONFIG.timeseries.econ);

// Check if we have function data across multiple years
const hasTimeSeriesIncome = computed(() => {
	const yearsWithData = Object.keys(DATA).filter((y) => {
		const funcOk = timeseriesFuncEnabled.value && DATA[y]?.income?.func;
		const econOk = timeseriesEconEnabled.value && DATA[y]?.income?.econ;
		return funcOk || econOk;
	});
	return yearsWithData.length > 1;
});

const hasTimeSeriesExpense = computed(() => {
	const yearsWithData = Object.keys(DATA).filter((y) => {
		const funcOk = timeseriesFuncEnabled.value && DATA[y]?.expense?.func;
		const econOk = timeseriesEconEnabled.value && DATA[y]?.expense?.econ;
		return funcOk || econOk;
	});
	return yearsWithData.length > 1;
});

// Default module order
const DEFAULT_ORDER = 'pub,inex,income,expense,timeseries-income,timeseries-expense,milestones,map,feedback';

// Ordered list of modules to render
const orderedModules = computed(() => {
	const orderStr = CONFIG.modules?.order || DEFAULT_ORDER;
	return orderStr.split(',').map((m: string) => m.trim()).filter(Boolean);
});

// Translate section slug to element ID
function translateSection(section: string): string {
	return sectionToElementId[section] || section;
}

// Extract section from hash (e.g., "#2024/koszonto" -> "koszonto")
function extractSectionFromHash(hash: string): string | null {
	const hashContent = hash.slice(1); // Remove #
	const match = hashContent.match(/^[\w-]+\/(.+)$/);
	if (match) {
		return match[1];
	}
	return null;
}

onMounted(() => {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	// Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
		if (
			location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
			location.hostname == this.hostname
		) {
			// Extract section from the new URL format (e.g., #2024/koszonto)
			const section = extractSectionFromHash(this.hash);
			const elementId = section ? translateSection(section) : null;
			var target = elementId ? $('#' + elementId) : $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				// Prevent scrollspy from updating URL during navigation scroll
				setNavigationScroll();
				scrollToElement(target, 72);
				return false;
			}
		}
	});

	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll-trigger').click(function () {
		$('.navbar-collapse').collapse('hide');
	});

	// Remove focus
	$('.js-scroll-trigger').click(function () {
		$(this).blur();
	});
});
</script>

<template>
	<div :class="'theme-' + slugify(year)">
		<NavBar />
		<SearchModal />
		<MastHead />
		<div class="flex-grow-1">
			<Welcome />
			<template v-for="mod in orderedModules" :key="mod">
				<PublicationSection v-if="mod === 'pub' && CONFIG.modules.pub" />
				<Inex class="bg-light" v-else-if="mod === 'inex' && CONFIG.modules.inex" />
				<VisualizationSection
					v-else-if="mod === 'income' && CONFIG.modules.income"
					id="income"
					side="income"
					:text="CONFIG.vis.incomeText"
					:title="CONFIG.vis.income"
				/>
				<VisualizationSection
					v-else-if="mod === 'expense'"
					class="bg-light"
					id="expense"
					side="expense"
					:text="CONFIG.vis.expenseText"
					:title="CONFIG.vis.expense"
				/>
				<TimeSeriesSection
					v-else-if="mod === 'timeseries-income' && hasTimeSeriesIncome && CONFIG.modules['timeseries-income']"
					id="time-series-income"
					side="income"
					:func-enabled="timeseriesFuncEnabled"
					:econ-enabled="timeseriesEconEnabled"
					:title="CONFIG.timeseries?.income || 'Bevételek idősorban'"
					:text="CONFIG.timeseries?.incomeText"
				/>
				<TimeSeriesSection
					v-else-if="mod === 'timeseries-expense' && hasTimeSeriesExpense && CONFIG.modules['timeseries-expense']"
					id="time-series-expense"
					side="expense"
					:func-enabled="timeseriesFuncEnabled"
					:econ-enabled="timeseriesEconEnabled"
					:title="CONFIG.timeseries?.expense || 'Kiadások idősorban'"
					:text="CONFIG.timeseries?.expenseText"
				/>
				<MilestoneSection
					v-else-if="mod === 'milestones' && canShowMilestones"
					class="pb-0"
					id="milestones"
				/>
				<MapSection
					v-else-if="mod === 'map' && canShowMap"
					id="map"
					class="bg-light"
				/>
				<FeedbackSection v-else-if="mod === 'feedback' && CONFIG.modules.feedback" />
			</template>
			<slot />
		</div>
		<Footer />
		<Social v-if="CONFIG.modules.social" />
		<FeedbackModal />
		<MoreInfoModal />
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/bootstrap';
@import '../scss/theme';

// Global styling for this template
body,
html {
	width: 100%;
	height: 100%;
}

// Typography
.text-white-75 {
	color: fade-out($white, 0.25);
}

h1,
h2 {
	text-transform: uppercase;
}

// Custom horizontal rules
hr.divider {
	max-width: 3.25rem;
	border-width: 0.2rem;
	border-color: $primary;
}

hr.light {
	border-color: $white;
}

// Button restyling
.btn {
	font-family: $font-family-sans-serif;
}

.btn-xl {
	padding: 1.25rem 2.25rem;
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	border-radius: 10rem;
}

// Page section padding
.page-section {
	padding: 8rem 0;
}

// Tooltips on mobile

@include media-breakpoint-down(sm) {
	.tooltip {
		bottom: 36px !important;
		display: flex;
		justify-content: center;
		left: 0;
		margin: auto;
		position: fixed !important;
		top: auto !important;
		transform: none !important;
		width: 100%;

		.arrow {
			display: none;
		}

		.tooltip-inner {
			max-width: none;
		}
	}
}
</style>
