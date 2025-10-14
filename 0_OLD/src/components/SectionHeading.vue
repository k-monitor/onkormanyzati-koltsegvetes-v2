<template>
	<h2>
		{{ title }}
		<small class="ml-3 text-muted">
			<i
				class="fas fa-caret-left"
				v-if="$d[years[index - 1]]"
				@click="$eventBus.$emit('yearSelected', years[index - 1])"
			></i>
			{{ year }}
			<i
				class="fas fa-caret-right"
				v-if="$d[years[index + 1]]"
				@click="$eventBus.$emit('yearSelected', years[index + 1])"
			></i>
		</small>
	</h2>
</template>

<script>
export default {
	props: ["title", "year"],
	computed: {
		index() {
			return this.years.indexOf(this.year);
		},
		years() {
			return Object.keys(this.$d).sort();
		}
	}
};
</script>