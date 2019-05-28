<template>
	<Layout>
		<h1>Index</h1>
		<pre>{{ JSON.stringify($config, null, 2)}}</pre>
	</Layout>
</template>

<script>
export default {};
</script>

<style>
.home-links a {
	margin-right: 1rem;
}
</style>
