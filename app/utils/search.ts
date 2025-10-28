//{
//	"expense": {
//		"func": {
//			"72111":["betegek","betegellátás","betegség","doki","doktor","egészségügy","orvos"]
//		}
//	}
//};

export default function search(year: string, term: string, range: number[]) {
	range = range || [];
	const meanValue = range.reduce((a, b) => a + b, 0) / range.length || 0;

	// console.log('search', year, term, range);

	let results: SearchResult[] = [];
	(['expense', 'income'] as const).forEach((side) => {
		(['econ', 'func'] as const).forEach((type) => {
			const tree = DATA[year]?.[side]?.[type] || null;
			if (!tree) return;
			const tags = (TAGS[side] || { type: {} })[type] || {};
			const treeResults = searchNode(tree, tags, term, range, []).map((result) => {
				result.side = side;
				result.type = type;
				result.distance = !meanValue
					? meanValue
					: Math.abs((result.value || 0) - meanValue);
				return result as SearchResult;
			});
			results = results.concat(treeResults);
		});
	});
	Object.keys(MILESTONES).forEach((milestoneId) => {
		const m = MILESTONES[milestoneId];
		if (m && m.year == year) {
			const text = m.title + '|' + m.description;
			const matchesInName = term
				.toLowerCase()
				.split(' ')
				.filter((t) => t.trim().length >= 3 && text.toLowerCase().includes(t)).length;
			const matchedTags = (m.tags || []).filter((tag) => tag.includes(term.toLowerCase()));
			if (matchedTags.length > 0 || matchesInName > 0) {
				results.push({
					distance: Number.MAX_SAFE_INTEGER,
					id: milestoneId,
					matchedId: false,
					matchesInName,
					name: m.title || '',
					path: [],
					side: 'milestones',
					tags: matchedTags,
					type: 'milestone',
					value: 0,
				});
			}
		}
	});
	return results;
}

function searchNode(
	node: BudgetNode,
	tags: Record<string, string[]>,
	term: string,
	range: number[],
	path: string[],
) {
	const nodeTags = tags[String(node.id)] || tags['0' + node.id] || [];
	const matchesInName = term
		.toLowerCase()
		.split(' ')
		.filter((t) => t.trim().length >= 3 && (node.name || '').toLowerCase().includes(t)).length;
	const matchedTags = nodeTags.filter((tag) => tag.includes(term.toLowerCase()));
	const matchedId = String(node.id || '').toLowerCase() == term.toLowerCase();
	const matchedValue =
		range.length === 1 ||
		(range.length === 2 && range[0]! <= node.value && node.value <= range[1]!);

	let results: Partial<SearchResult>[] = [];
	if (node.id && (matchedTags.length > 0 || matchesInName > 0 || matchedId || matchedValue)) {
		results.push({
			id: String(node.id),
			matchedId,
			matchesInName,
			name: node.name,
			path: path.concat(String(node.id)),
			tags: matchedTags,
			value: node.value,
		});
	}
	path = node.id ? path.concat(String(node.id)) : path; // <-- root has no ID, but every other node must have iD
	(node.children || []).forEach((children) => {
		results = results.concat(searchNode(children, tags, term, range, path));
	});
	return results;
}
