<script setup lang="ts">
// TODO LATER replace confirms with AlertDialogs

const { data } = await useBudgetData();
const slugifiedYear = useRoute().params.year as string;
const year = computed(() => deslugifyYear(slugifiedYear, getYears(data.value)) || slugifiedYear);
</script>

<template>
	<PageFrame
		:title="year"
		group-title="Költségvetés"
	>
		<PageSection>
			<p>
				Az itt végzett és elmentett módosítások során a <code>budget.xlsx</code> fájl újra
				lesz építve, melynek során a program csak az adatokat tudja megőrizni, a formázást
				és egyéb Excel funkciókat nem - ezek elveszhetnek.
			</p>
		</PageSection>
		<YearRenameSection :year="year" />
		<YearDeleteSection :year="year" />
	</PageFrame>
</template>
