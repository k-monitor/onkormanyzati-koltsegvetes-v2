declare global {
	interface Window {
		$: any; // jQuery
	}
}

export type BudgetNode = {
	id?: string | number;
	parent?: string | number | null;
	name: string;
	children?: BudgetNode[];
	value: number;
};

export type BudgetData = Record<
	string, // year
	{
		income: {
			econ: BudgetNode;
			func?: BudgetNode | null;
		};
		expense: {
			econ: BudgetNode;
			func?: BudgetNode | null;
		};
	}
>;
