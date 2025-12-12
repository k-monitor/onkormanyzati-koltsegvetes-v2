import fs from 'fs';

export default defineEventHandler(() => {
	return fs.readdirSync('static/assets/ms');
});
