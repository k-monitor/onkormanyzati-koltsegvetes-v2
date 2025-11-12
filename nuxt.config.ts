import './scripts/prepare.js';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devServer: { port: 8080 },
	devtools: { enabled: true },
	srcDir: 'src/',
	dir: {
		public: 'static',
	},
	modules: ['@nuxt/eslint', '@nuxt/scripts'],
	scripts: {
		registry: {
			googleAnalytics: true,
			googleTagManager: true,
		},
	},
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
