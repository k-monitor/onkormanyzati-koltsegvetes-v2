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
	/**
	 * "Államháztartási azonosító" — a stable, place-independent identifier of the
	 * budget item. Only present when the AHT column is enabled in the config and
	 * filled in budget.xlsx. Used by the time series to match items across years.
	 */
	aht?: string;
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
	position: { lat: number; lng: number } | null;
	onlyOnMap: boolean;
};

export type MilestoneWithId = Milestone & { id: string };

// static/data/milestones/index.json — see scripts/prepare-milestones.js
export type MilestonesIndex = {
	rels: { [year: string]: Record<string, string> };
	years: { [year: string]: { file: string; count: number } };
	positioned: { [id: string]: Milestone };
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
	year?: string | number;
};
