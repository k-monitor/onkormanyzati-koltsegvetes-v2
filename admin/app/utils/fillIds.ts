import type { BudgetNode } from '../../../src/utils/types';

export default (
	newChildren: BudgetNode[],
	existingChildIds: string[],
	parentId: string,
	childrenIdLength: number,
	maxNewChildren: number,
): BudgetNode[] => {
	// TODO LATER some arguments can be derived from others, but are calculated and used outside, maybe refactor to calculate them all here and return all of them in an object

	// TODO LATER write test cases
	// - test that output array length matches maxNewChildren
	// - test that every element has ID that matches the format
	// - test that output IDs are unique and different from existing
	// - test that received valid IDs are preserved

	const fullIdLength = parentId.length + childrenIdLength;

	const receivedValidIds = new Set<string>(); // full IDs

	// gather received IDs, that match the format and are unique
	for (const n of newChildren) {
		const id = String(n.id);
		if (
			id &&
			id.length === fullIdLength &&
			id.startsWith(parentId) &&
			!existingChildIds.includes(id) &&
			!receivedValidIds.has(id)
		) {
			receivedValidIds.add(id);
		} else {
			n.id = '';
		}
	}

	const existingChildIdsSet = new Set(
		[...existingChildIds, ...receivedValidIds].map((id) =>
			Number(id.substring(parentId.length)),
		),
	); // only sub ID numbers

	// generate new incremental IDs for nodes without valid ID
	let nextChildId = 1;
	for (const n of newChildren) {
		if (receivedValidIds.has(String(n.id))) {
			continue;
		}

		while (existingChildIdsSet.has(nextChildId)) nextChildId++;
		n.id = parentId + String(nextChildId).padStart(childrenIdLength, '0');
		nextChildId++;
	}

	return newChildren.slice(0, maxNewChildren);
};
