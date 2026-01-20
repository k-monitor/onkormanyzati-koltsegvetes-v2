<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next';

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
			<Alert
				class="not-prose"
				variant="destructive"
			>
				<CircleAlert />
				<AlertTitle>Figyelem!</AlertTitle>
				<AlertDescription>
					<p class="my-0">
						Az alábbi műveletek során a <code>budget.xlsx</code> fájl újra lesz építve.
						A program csak az adatokat tudja megőrizni;
						<strong> a formázások és egyéb Excel funkciók elveszhetnek. </strong>
					</p>
				</AlertDescription>
			</Alert>
		</PageSection>
		<YearRenameSection :year="year" />
		<YearDeleteSection :year="year" />
	</PageFrame>
</template>
