// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/eslint'],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					// TODO LATER upgrade Bootstrap to v5 and remove this
					silenceDeprecations: ['abs-percent'],
				},
			},
		},
	},
});
