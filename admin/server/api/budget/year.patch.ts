import path from 'path';
import { z } from 'zod';

const bodySchema = z.object({
	oldName: z.string(),
	newName: z.string(),
});

export default defineEventHandler(async (event) => {
	const { oldName, newName } = await readValidatedBody(event, bodySchema.parse);

	const file = path.resolve(kokoDir(), 'input/budget.xlsx');
	const wb = readXLSX(file);
	renameSheet(wb, `${oldName} BEVÉTEL`, `${newName} BEVÉTEL`);
	renameSheet(wb, `${oldName} KIADÁS`, `${newName} KIADÁS`);
	writeXLSX(wb, file);

	// FIXME need to call prepare script/logic in kokoDir and await it
});
