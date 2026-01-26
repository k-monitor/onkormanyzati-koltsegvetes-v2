<script setup lang="ts">
const loading = useLoading();
</script>

<template>
	<div
		v-if="loading"
		id="loading"
		class="bg-background/75 absolute inset-0 z-10 flex flex-col items-center justify-center"
	>
		<Spinner class="mb-4 size-12" />
		<h1
			v-if="loading !== !!loading"
			class="mt-4 text-lg font-medium"
		>
			{{ loading }}
		</h1>
	</div>
</template>
