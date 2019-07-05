<template>
	<div class="card">
		<img
		 :src="'http://mintavaros.deepdata.hu' + milestone.picture"
		 class="card-img-top"
		 alt="..."
		>
		<div class="card-body">
			<h5 class="card-title">{{ milestone.title }}</h5>
			<p class="card-text small">{{ milestone.description }}</p>
			<p class="card-text font-weight-bold small">{{ milestone.text }}</p>
		</div>
	</div>
</template>

<script>
export default {
	props: ['milestone']
}
</script>

