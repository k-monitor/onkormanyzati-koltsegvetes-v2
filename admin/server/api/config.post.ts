import { CONFIG_FILE } from '../utils/constants';

export default defineEventHandler(async (event) => {
	await callNodeListener(
		useMulter(INPUT_DIR, CONFIG_FILE, [XLSX_MIME_TYPE]).single('config') as any,
		event.node.req,
		event.node.res,
	);
});
