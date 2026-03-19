import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	css: ['~/assets/css/tailwind.css'],
	devtools: { enabled: true },
	modules: ['@nuxt/eslint', '@vueuse/nuxt', 'shadcn-nuxt'],
	runtimeConfig: {
		kokoDir: '', // NUXT_KOKO_DIR
		admin: {
			user: process.env.ADMIN_USER || '', // NUXT_ADMIN_USER (or ADMIN_USER)
			pass: process.env.ADMIN_PASS || '', // NUXT_ADMIN_PASS (or ADMIN_PASS)
		},
		second: {
			user: process.env.SECOND_USER || '', // NUXT_SECOND_USER (or SECOND_USER)
			pass: process.env.SECOND_PASS || '', // NUXT_SECOND_PASS (or SECOND_PASS)
		},
		deployCmd: process.env.DEPLOY_CMD || '', // NUXT_DEPLOY_CMD (or DEPLOY_CMD)
		public: {
			url: process.env.PUBLIC_URL || '', // NUXT_PUBLIC_URL (or PUBLIC_URL)
		},
	},
	shadcn: {
		componentDir: '@/components/ui',
		prefix: '',
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
