<script setup lang="ts">
const loading = useLoading();
</script>
<template>
	<div
		id="loading"
		class="bg-background/75 absolute inset-0 z-10 flex flex-col items-center justify-center"
		v-if="loading"
	>
		<Spinner class="mb-4 size-12" />
		<h1
			class="mt-4 text-lg font-medium"
			v-if="loading !== !!loading"
		>
			{{ loading }}
		</h1>
	</div>
</template>
