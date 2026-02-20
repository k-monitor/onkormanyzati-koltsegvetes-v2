export default defineEventHandler((event) => {
	// This file is a customized version of this middleware:
	// https://github.com/kgierke/nuxt-basic-auth/blob/5c006223040862bfb3f0d0d3a7369a64f0941fe0/src/runtime/server/middleware/basic-auth.ts

	const { admin, second } = useRuntimeConfig(); // NUXT_ prefixed overrides
	const ADMIN_USER = admin.user || process.env.ADMIN_USER;
	const ADMIN_PASS = admin.pass || process.env.ADMIN_PASS;
	const SECOND_USER = second.user || process.env.SECOND_USER;
	const SECOND_PASS = second.pass || process.env.SECOND_PASS;

	const users = [];
	if (ADMIN_USER && ADMIN_PASS) {
		users.push({ username: ADMIN_USER, password: ADMIN_PASS });
	}
	if (SECOND_USER && SECOND_PASS) {
		users.push({ username: SECOND_USER, password: SECOND_PASS });
	}

	/**
	 * If the request is a prerender request, do nothing.
	 */
	if (event.node.req.headers?.['x-nitro-prerender'] && import.meta.env.NODE_ENV === 'prerender') {
		return;
	}

	/**
	 * If no users are defined, throw an error.
	 */
	if (!users?.length) {
		throw createError({ status: 500, message: 'Insufficient configuration' });
	}

	let authenticated = false;

	/**
	 * Get the credentials from the Authorization header.
	 */
	const credentials = event.node.req.headers?.authorization?.split(' ')[1];

	/**
	 * If the credentials are defined, check if they match any of the users.
	 */
	if (credentials) {
		const [username, password] = Buffer.from(credentials, 'base64').toString('utf8').split(':');

		authenticated = users.some(
			(user) => user.username === username && user.password === password,
		);
	}

	/**
	 * If the user is not authenticated or the credentials are not defined, send a 401 response.
	 */
	if (!authenticated) {
		event.node.res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area", charset="UTF-8"');
		event.node.res.statusCode = 401;
		event.node.res.end('Access denied');
	}
});
