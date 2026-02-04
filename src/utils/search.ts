//{
//	"expense": {
//		"func": {
//			"72111":["betegek","betegellátás","betegség","doki","doktor","egészségügy","orvos"]
//		}
//	}
//};

export default function search(year: string | null | undefined, term: string, range: number[]) {
	range = range || [];
	const meanValue = range.reduce((a, b) => a + b, 0) / range.length || 0;

	// console.log('search', year, term, range);

	let results: SearchResult[] = [];
	const yearsToSearch = year ? [year] : Object.keys(DATA);

	yearsToSearch.forEach((searchYear) => {
		(['expense', 'income'] as const).forEach((side) => {
			(['econ', 'func'] as const).forEach((type) => {
				const tree = DATA[searchYear]?.[side]?.[type] || null;
				if (!tree) return;
				const tags = (TAGS[side] || { type: {} })[type] || {};
				const treeResults = searchNode(tree, tags, term, range, []).map((result) => {
					result.side = side;
					result.type = type;
					result.year = searchYear;
					result.distance = !meanValue
						? meanValue
						: Math.abs((result.value || 0) - meanValue);
					return result as SearchResult;
				});
				results = results.concat(treeResults);
			});
		});
	});
	Object.keys(MILESTONES).forEach((milestoneId) => {
		const m = MILESTONES[milestoneId];
		if (m && (!year || m.year == year)) {
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
					year: m.year,
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

	// Check if term-based matching is satisfied (when a term is provided)
	const hasSearchTerm = term.trim().length >= 3;
	const matchesTerm = matchedTags.length > 0 || matchesInName > 0 || matchedId;

	// Check if value-based matching is satisfied (when a range is provided)
	const hasValueRange = range.length > 0;

	// When both term and range are provided, require both to match
	// When only term is provided, require term match
	// When only range is provided, require value match
	const matchesCriteria = hasSearchTerm && hasValueRange
		? matchesTerm && matchedValue
		: hasSearchTerm
			? matchesTerm
			: hasValueRange
				? matchedValue
				: false;

	let results: Partial<SearchResult>[] = [];
	if (node.id && matchesCriteria) {
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
