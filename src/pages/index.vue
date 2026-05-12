<script setup lang="ts">
const router = useRouter();
const { setHashMode, getInitialHashYear, reinitializeFromHash } = useYear();

setHashMode('no-year');

const initialHashYear = getInitialHashYear();
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';

const canShowMap = computed(() => {
	return CONFIG.modules.map && Object.values(MILESTONES).some((m) => m.position);
});

onMounted(() => {
	if (initialHashYear) {
		router.push('/ev' + initialHash);
	} else if (initialHash) {
		reinitializeFromHash();
	}
});

useHead({
	meta: [
		{
			property: 'og:title',
			content: CONFIG.seo.ogTitle,
		},
	],
	title: [CONFIG.seo.pageTitle, CONFIG.seo.siteName].filter(Boolean).join(' | '),
});

// Whether func/econ views are enabled for timeseries (default: both enabled)
const timeseriesFuncEnabled = computed(
	() => CONFIG.timeseries?.func == null || !!CONFIG.timeseries.func,
);
const timeseriesEconEnabled = computed(
	() => CONFIG.timeseries?.econ == null || !!CONFIG.timeseries.econ,
);

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
</script>

<template>
	<DefaultLayout>
		<MastHead />
		<Welcome />
		<!-- FIXME tutorial in Welcome needs year view -->
		<template
			v-for="mod in MODULES_ORDER"
			:key="mod"
		>
			<TimeSeriesSection
				v-if="
					mod === 'timeseries-income' &&
					hasTimeSeriesIncome &&
					CONFIG.modules['timeseries-income']
				"
				id="time-series-income"
				side="income"
				:func-enabled="timeseriesFuncEnabled"
				:econ-enabled="timeseriesEconEnabled"
				:title="CONFIG.timeseries?.income || 'Bevételek idősorban'"
				:text="CONFIG.timeseries?.incomeText"
			/>
			<TimeSeriesSection
				v-else-if="
					mod === 'timeseries-expense' &&
					hasTimeSeriesExpense &&
					CONFIG.modules['timeseries-expense']
				"
				id="time-series-expense"
				side="expense"
				:func-enabled="timeseriesFuncEnabled"
				:econ-enabled="timeseriesEconEnabled"
				:title="CONFIG.timeseries?.expense || 'Kiadások idősorban'"
				:text="CONFIG.timeseries?.expenseText"
			/>
			<MapSection
				v-else-if="mod === 'map' && canShowMap"
				id="map"
				class="bg-light"
				:hide-year="true"
			/>
			<FeedbackSection v-else-if="mod === 'feedback' && CONFIG.modules.feedback" />
		</template>
	</DefaultLayout>
</template>
