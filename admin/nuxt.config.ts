const { ADMIN_USER, ADMIN_PASS, SECOND_USER, SECOND_PASS } = process.env;
const users = [{ username: ADMIN_USER || 'admin', password: ADMIN_PASS || 'admin' }];
if (SECOND_USER && SECOND_PASS) {
	users.push({ username: SECOND_USER, password: SECOND_PASS });
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@kgierke/nuxt-basic-auth'],
	basicAuth: { users },
});
