<script setup lang="ts">
defineProps<{ year: string }>();
</script>

<template>
	<div
		aria-hidden="true"
		aria-labelledby="search-modal-label"
		class="modal fade"
		id="search-modal"
		role="dialog"
		tabindex="-1"
	>
		<SearchModalContent :year="year" />
	</div>
</template>
