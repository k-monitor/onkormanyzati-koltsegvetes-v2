import { joinURL } from 'ufo';

export default () => {
	const baseURL = useRuntimeConfig().app.baseURL;
	return (path: string) => joinURL(baseURL, path);
};
