const configJson = require('./config.json');

// Settings

const url = 'http://koko.deepdata.hu/';
const modules = {
	income: true,
	inex: true,
	milestones: true
};

const seo = {
	ogImage: 'https://picsum.photos/id/122/2048/1536',
	ogImageType: 'image/png',
	ogImageHeight: 1536,
	ogImageWidth: 2048
};

// ---

module.exports = Object.assign({
	modules,
	seo,
	url,
}, configJson);
