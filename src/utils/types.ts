declare global {
	interface Window {
		$: any; // jQuery
		introJs: () => any;
	}
}

export type BudgetNode = {
	id?: string | number;
	parent?: string | number | null;
	name: string;
	children?: BudgetNode[];
	value: number;
};

export type BudgetData = {
	[year: string]: {
		income: {
			econ: BudgetNode;
			func?: BudgetNode | null;
		};
		expense: {
			econ: BudgetNode;
			func?: BudgetNode | null;
		};
	};
};

export type Milestone = {
	year: string | number;
	picture: string;
	overlay: boolean;
	title: string;
	description: string;
	vid: string | null;
	tags: string[];
	nodeIds: string[];
};

export type MilestoneWithId = Milestone & { id: string };

export type Milestones = {
	milestones: { [id: string]: Milestone };
	rels: { [year: string]: Record<string, string> };
};

export type SearchResult = {
	distance: number;
	id: string;
	matchedId: boolean;
	matchesInName: number;
	name: string;
	path: string[];
	side: 'income' | 'expense' | 'milestones';
	tags: string[];
	type: 'econ' | 'func' | 'milestone';
	value: number;
};
