<script setup lang="ts">
const loading = useLoading();
</script>
<template>
	<div
		id="loading"
		class="absolute inset-0 flex flex-col items-center justify-center bg-background/75 z-10"
		v-if="loading"
	>
		<Spinner class="size-12 mb-4" />
		<h1
			class="mt-4 text-lg font-medium"
			v-if="loading !== !!loading"
		>
			{{ loading }}
		</h1>
	</div>
</template>
