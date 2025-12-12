export default defineEventHandler(async (event) => {
	await callNodeListener(
		useMulter(INPUT_DIR, 'config.xlsx', [XLSX_MIME_TYPE]).single('config') as any,
		event.node.req,
		event.node.res,
	);
});
