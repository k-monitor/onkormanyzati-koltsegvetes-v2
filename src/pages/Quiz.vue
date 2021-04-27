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
				src="https://y5rhdxadoop.typeform.com/to/vFJNSBoe"
			></iframe>
		</div>
		<Footer />
	</div>
</template>

<script>
import config from "~/data/config.json"; // import is needed because metaInfo below cannot access $config

export default {
	metaInfo: {
		// TODO lang and CSS should be centralized
		htmlAttrs: {
			lang: "hu",
		},
		link: [
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
			},
			{
				rel: "stylesheet",
				href:
					"https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=latin-ext",
			},
			{
				rel: "stylesheet",
				href:
					"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.1/css/all.min.css",
			},
		],
		title: "Kvíz",
		meta: [
			{
				property: "og:site_name",
				content: config.seo.siteName,
			},
			{
				property: "og:title",
				content: "Kvíz",
			},
			{
				name: "description",
				property: "og:description",
				content: config.seo.description,
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:image",
				content: config.seo.ogImage,
			},
			{
				property: "og:image:type",
				content: config.seo.ogImageType,
			},
		],
	},
};
</script>