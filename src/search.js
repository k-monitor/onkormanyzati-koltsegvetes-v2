const $data = require('../src/data/data.json');
const $milestones = require('../src/data/milestones.json').milestones;
const $tags = require('../src/data/tags.json');
//{
//	"expense": {
//		"func": {
//			"72111":["betegek","betegellátás","betegség","doki","doktor","egészségügy","orvos"]
//		}
//	}
//};

export default function search(year, term, range) {
	range = range || [];
	const meanValue = range.reduce((a, b) => a + b, 0) / range.length || 0;

	console.log('search', year, term, range);

	let results = [];
	['expense', 'income'].forEach(side => {
		['econ', 'func'].forEach(type => {
			const tree = $data[year][side][type] || {};
			const tags = ($tags[side] || { type: {} })[type] || {};
			const treeResults = searchNode(tree, tags, term, range, []).map(result => {
				result.side = side;
				result.type = type;
				result.distance = meanValue && Math.abs(result.value - meanValue);
				return result;
			});
			results = results.concat(treeResults);
		});
	});
	Object.keys($milestones).forEach(milestoneId => {
		const m = $milestones[milestoneId];
		if (m.year == year) {
			const text = m.title + '|' + m.description;
			const matchesInName = term.toLowerCase().split(' ').filter(t => t.trim().length >= 3 && text.toLowerCase().includes(t)).length;
			const matchedTags = (m.tags || []).filter(tag => tag.includes(term.toLowerCase()));
			if (matchedTags.length > 0 || matchesInName > 0) {
				results.push({
					id: milestoneId,
					matchesInName,
					name: m.title || '',
					side: 'milestones',
					tags: matchedTags,
					type: 'milestone',
				});
			}
		}
	});
	return results;
}

function searchNode(node, tags, term, range, path) {
	const nodeTags = (tags[node.id] || tags['0' + node.id] || []);
	const matchesInName = term.toLowerCase().split(' ').filter(t => t.trim().length >= 3 && (node.name || '').toLowerCase().includes(t)).length;
	const matchedTags = nodeTags.filter(tag => tag.includes(term.toLowerCase()));
	const matchedId = String(node.id || '').toLowerCase() == term.toLowerCase();
	const matchedValue = (range.length === 1) ||
		(range.length === 2 && range[0] <= node.value && node.value <= range[1]);

	let results = [];
	if (node.id && (matchedTags.length > 0 || matchesInName > 0 || matchedId || matchedValue)) {
		results.push({
			id: node.id,
			matchedId,
			matchesInName,
			name: node.name,
			path: path.concat(node.id),
			tags: matchedTags,
			value: node.value,
		});
	}
	path = node.id ? path.concat(node.id) : path; // <-- root has no ID, but every other node must have iD
	(node.children || []).forEach(children => {
		results = results.concat(searchNode(children, tags, term, range, path));
	});
	return results;
}
