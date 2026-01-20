import path from 'path';
import { z } from 'zod';
import { deleteSheet } from '~~/server/utils/xlsx';

const bodySchema = z.object({
	name: z.string().min(4),
});

export default defineEventHandler(async (event) => {
	const { name } = await readValidatedBody(event, bodySchema.parse);

	const file = path.resolve(kokoDir(), 'input/budget.xlsx');
	const wb = readXLSX(file);
	deleteSheet(wb, `${name} BEVÉTEL`);
	deleteSheet(wb, `${name} KIADÁS`);
	writeXLSX(wb, file);
	await runPrepareScript();
});
