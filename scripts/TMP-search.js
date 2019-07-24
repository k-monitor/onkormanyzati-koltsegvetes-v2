const $functions = require('../src/data/functions.json');
const $tags = require('../src/data/tags.json');

function mapToMatch(id, name, tags, path) {
	return { id, name, tags, match: tags.length, path };
}

function searchFunctionalCategories(searchTerm) {
	return Object.keys($tags)
		.map(funcId => {
			const tags = $tags[funcId].filter(tag => tag.includes(searchTerm));
			return mapToMatch(funcId, $functions[Number(funcId)], tags, null);
		})
		.filter(r => r.match > 0)
		//.sort((a, b) => b.match - a.match)
		//.slice(0, 5);
}

console.log(searchFunctionalCategories("menza"));
