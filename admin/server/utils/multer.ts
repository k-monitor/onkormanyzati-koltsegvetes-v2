import multer from 'multer';

export const INPUT_DIR = 'input';
export const IMG_DIR = 'static/assets/img';
export const MS_DIR = 'static/assets/ms';

export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function useMulter(dir: string, filename: string | null, filetypes: string[]) {
	return multer({
		storage: multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, dir);
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
