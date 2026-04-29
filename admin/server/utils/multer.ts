import multer from 'multer';
import path from 'path';

export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function useMulter(dir: string, filename: string | null, filetypes: string[]) {
	const fullDir = path.resolve(useConfig().kokoDir, dir);
	return multer({
		storage: multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, fullDir);
			},
			filename: (req, file, cb) => {
				cb(null, filename || file.originalname);
			},
		}),
		fileFilter: (req, file, cb) => {
			if (filetypes.includes(file.mimetype)) {
				cb(null, true);
			} else {
				cb(new Error('Invalid file type'));
			}
		},
	});
}
