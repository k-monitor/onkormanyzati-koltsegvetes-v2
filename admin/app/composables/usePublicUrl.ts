export default () => {
	const NUXT_PUBLIC_URL = useRuntimeConfig().public.url;
	const PUBLIC_URL = import.meta.server ? process.env.PUBLIC_URL || '' : '';
	return useState('publicUrl', () => NUXT_PUBLIC_URL || PUBLIC_URL);
};
