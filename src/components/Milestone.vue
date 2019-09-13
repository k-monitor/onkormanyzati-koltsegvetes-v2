<template>
	<div class="card">
		<img
		 :src="milestone.picture"
		 class="card-img-top"
		 alt="..."
		>
		<div class="card-body">
			<h5 class="card-title">{{ milestone.title }}</h5>
			<p class="card-text small">{{ milestone.description }}</p>
		</div>
	</div>
</template>

<script>
export default {
	props: ['milestone']
}
</script>

