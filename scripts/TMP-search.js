const $data = require('../src/data/data.json');
const $tags = //require('../src/data/tags.json');
{
	"expense": {
		"func": {
			"72111":["betegek","betegellátás","betegség","doki","doktor","egészségügy","orvos"]
		}
	}
};

function search(year, term) {
	let results = [];
	['expense', 'income'].forEach(side => {
		['econ', 'func'].forEach(type => {
			const tree = $data[year][side][type];
			const tags = ($tags[side] || { type: {} })[type] || {};
			const treeResults = searchNode(tree, tags, term, []).map(result => {
				result.side = side;
				result.type = type;
				return result;
			});
			results = results.concat(treeResults);

		});
	});
	return results;
}

function searchNode(node, tags, term, path) {
	const nodeTags = (tags[node.id] || tags[Number(node.id)] || tags[node.altId] || []);
	const matchedTags = nodeTags.filter(tag => tag.includes(term));
	let results = [];
	if (matchedTags.length > 0) {
		results.push({
			altId: node.altId,
			id: node.id,
			name: node.name,
			path,
			tags: matchedTags,
			value: node.value,
		});
	}
	path = node.id ? path.concat(node.id) : path; // <-- root has no ID, but every other node must have iD
	(node.children || []).forEach(children => {
		results = results.concat(searchNode(children, tags, term, path));
	});
	return results;
}

console.log(search(2018, 'beteg'));