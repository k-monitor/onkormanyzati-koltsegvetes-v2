// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	runtimeConfig: {
		kokoDir: '', // NUXT_KOKO_DIR
		admin: {
			user: '', // NUXT_ADMIN_USER
			pass: '', // NUXT_ADMIN_PASS
		},
		second: {
			user: '', // NUXT_SECOND_USER
			pass: '', // NUXT_SECOND_PASS
		},
		deployCmd: '', // NUXT_DEPLOY_CMD
		publicUrl: '', // NUXT_PUBLIC_URL
	},
});
