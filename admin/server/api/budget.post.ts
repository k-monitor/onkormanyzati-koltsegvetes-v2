export default defineEventHandler(async (event) => {
	await callNodeListener(
		useMulter(INPUT_DIR, 'budget.xlsx', [XLSX_MIME_TYPE]).single('budget') as any,
		event.node.req,
		event.node.res,
	);
});
