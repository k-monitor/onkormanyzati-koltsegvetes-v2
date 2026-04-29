import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	css: ['~/assets/css/tailwind.css'],
	devtools: { enabled: true },
	modules: ['@nuxt/eslint', '@vueuse/nuxt', 'shadcn-nuxt'],
	// runtimeConfig: {}
	// intentionally NOT using runtimeConfig so that values won't be burnt into the app
	shadcn: {
		componentDir: '@/components/ui',
		prefix: '',
	},
	vite: {
		optimizeDeps: {
			include: [
				'class-variance-authority',
				'clsx',
				'exceljs', // CJS
				'lucide-vue-next',
				'reka-ui',
				'slugify', // CJS
				'tailwind-merge',
				'vue-sonner',
			],
		},
		plugins: [tailwindcss()],
	},
});
