import type { BudgetData } from '../../../src/utils/types';

export default async () => {
	const { data, pending, refresh } = await useAsyncData<BudgetData>(
		'data-json',
		(_nuxtApp, { signal }) => $fetch('/data/data.json', { signal }),
	);
	return {
		data,
		pending,
		refresh,
	};
};
