import path from 'path';
import { z } from 'zod';

const bodySchema = z.object({
	oldName: z.string().min(4),
	newName: z.string().min(4),
});

export default defineEventHandler(async (event) => {
	// TODO LATER should we enforce 4 digits and space prefix?

	const { oldName, newName } = await readValidatedBody(event, bodySchema.parse);

	const file = path.resolve(kokoDir(), 'input/budget.xlsx');
	const wb = await readXLSX(file);
	renameSheet(wb, `${oldName} BEVÉTEL`, `${newName} BEVÉTEL`);
	renameSheet(wb, `${oldName} KIADÁS`, `${newName} KIADÁS`);
	await writeXLSX(wb, file);
	await runPrepareScript();
});
