<template>
	<div>
	</div>
</template>

<script>
import data from "~/data/data.json";

export default {
	props: ["year"],
	data() {
		return {};
	},
	computed: {
		data() {
			return data[this.year];
		}
	}
};
</script>
