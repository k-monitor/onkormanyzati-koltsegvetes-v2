import { BUDGET_FILE } from '../utils/constants';

export default defineEventHandler(async (event) => {
	await callNodeListener(
		useMulter(INPUT_DIR, BUDGET_FILE, [XLSX_MIME_TYPE]).single('budget') as any,
		event.node.req,
		event.node.res,
	);
	await runPrepareScript();
});
