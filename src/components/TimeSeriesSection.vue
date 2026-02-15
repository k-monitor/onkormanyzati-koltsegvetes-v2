<script setup lang="ts">
const props = defineProps<{
	side: 'expense' | 'income';
	title: string;
	text?: string;
	funcEnabled?: boolean;
	econEnabled?: boolean;
}>();

// Default both to true if not provided
const isFuncEnabled = computed(() => props.funcEnabled !== false);
const isEconEnabled = computed(() => props.econEnabled !== false);

const years = computed(() => Object.keys(DATA).sort());
const yearsRange = computed(() => {
	if (years.value.length === 0) return '';
	if (years.value.length === 1) return years.value[0];
	return `${years.value[0]} - ${years.value[years.value.length - 1]}`;
});

// Check if functional data is available (and enabled by config)
const hasFuncData = computed(() => {
	return isFuncEnabled.value && years.value.some((year) => DATA[year]?.expense?.func && props.side === 'expense' || DATA[year]?.income?.func && props.side === 'income');
});

// Check if economic data is available (and enabled by config)
const hasEconData = computed(() => {
	return isEconEnabled.value && years.value.some((year) => DATA[year]?.expense?.econ && props.side === 'expense' || DATA[year]?.income?.econ && props.side === 'income');
});

const activeView = ref<'func' | 'econ'>(hasFuncData.value ? 'func' : 'econ');

</script>

<template>
	<section class="page-section">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-10 text-center">
					<h2>
						{{ title }}
						<small class="ml-3 text-muted">{{ yearsRange }}</small>
					</h2>
					<hr class="divider my-4 mb-5" />
				</div>
			</div>

			<!-- View tabs -->
			<div class="row justify-content-center mb-4" v-if="hasFuncData && hasEconData">
				<div class="col-lg-8 text-center">
					<ul class="justify-content-center mb-3 nav nav-pills w-100">
						<li class="nav-item" v-if="hasFuncData">
							<a
								class="nav-link"
								:class="{ active: activeView === 'func' }"
								:title="CONFIG.vis?.funcHint"
								href="javascript:void(0)"
								data-placement="bottom"
								data-toggle="tooltip"
								@click="activeView = 'func'"
							>
								{{ CONFIG.vis?.func || 'Funkcionális nézet' }}
							</a>
						</li>
						<li class="nav-item" v-if="hasEconData">
							<a
								class="nav-link"
								:class="{ active: activeView === 'econ' }"
								:title="CONFIG.vis?.econHint"
								href="javascript:void(0)"
								data-placement="bottom"
								data-toggle="tooltip"
								@click="activeView = 'econ'"
							>
								{{ CONFIG.vis?.econ || 'Közgazdasági nézet' }}
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="row justify-content-center">
				<div class="col-lg-10">
					<TimeSeries :side="side" :view="activeView" />
				</div>
			</div>
			<div
				class="row justify-content-center mt-5"
				v-if="text"
			>
				<div class="col-lg-8 text-center">
					<VueMarkdown
						:source="text"
						:anchorAttributes="{ target: '_blank' }"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
