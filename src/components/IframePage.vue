<template>
	<div class="d-flex flex-column _h-100">
		<NavBar
			:subpage-mode="true"
			:years="[]"
		/>
		<div
			class="bg-primary"
			style="padding-top: 7rem; height: 90vh; min-height: 600px;"
		>
			<iframe
				class="h-100 w-100"
				frameborder="0"
				:src="$config.iframe.url"
			></iframe>
		</div>
		<Footer />
	</div>
</template>

<script>
import config from "~/data/config.json"; // import is needed because metaInfo below cannot access $config

export default {
	metaInfo: {
		title: config.iframe.title,
	},
};
</script>