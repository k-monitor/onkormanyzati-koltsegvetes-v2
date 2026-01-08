<script setup lang="ts">
const loading = useLoading();
</script>
<template>
	<div
		id="loading"
		class="align-items-center d-flex flex-column h-100 justify-content-center position-absolute w-100"
		v-if="loading"
	>
		<div
			class="spinner-border"
			role="status"
		>
			<span class="visually-hidden">Loading...</span>
		</div>
		<h1
			class="mt-4"
			v-if="loading !== !!loading"
		>
			{{ loading }}
		</h1>
	</div>
</template>
