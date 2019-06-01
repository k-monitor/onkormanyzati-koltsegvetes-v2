<template>
	<div>
		<h1>HELLÓ INEX {{ year }}</h1>
		<h2>{{ name }}</h2>
	</div>
</template>

<script>
import data from '~/data/data.byhand.js';

export default {
	props: ['year'],
	data() {
		return {
			name: data.d18.name
		}
	}
}
</script>
