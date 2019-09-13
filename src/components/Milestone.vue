<template>
	<div class="milestone d-flex align-items-end" :style="{ backgroundImage: 'url(' + milestone.picture + ')' }">
		<h5 class="milestone-title text-center text-white w-100">{{ milestone.title }}</h5>
		<!--<img
		 :src="milestone.picture"
		 class="card-img-top"
		 alt="..."
		>
		<div class="card-body">
			<h5 class="card-title">{{ milestone.title }}</h5>
			<p class="card-text small">{{ milestone.description }}</p>
		</div>-->
	</div>
</template>

<script>
export default {
	props: ['milestone']
}
</script>

<style lang="scss">
.milestone {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	cursor: pointer;
	filter: brightness(0.8);
	transition: all .2s ease;

	.milestone-title {
		// https://cssgradient.io/
		$shadow: black;
		background: $shadow;
		background: -moz-linear-gradient(0deg, $shadow 0%, rgba(0,0,0,0) 100%);
		background: -webkit-linear-gradient(0deg, $shadow 0%, rgba(0,0,0,0) 100%);
		background: linear-gradient(0deg, $shadow 0%, rgba(0,0,0,0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);

		margin: 0;
		padding: .5rem 0;
		text-shadow: 0px 0px 5px black;
		transition: all .2s ease;
	}

	&:hover {
		filter: none;

		.milestone-title {
			padding: 1rem 0;
		}
	}
}
</style>

