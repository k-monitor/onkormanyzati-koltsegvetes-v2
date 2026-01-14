import slugify from 'slugify';
import type { BudgetData } from '../../../src/utils/types';

export function getYears(budgetData: BudgetData | undefined) {
	return Object.keys(budgetData || {});
}

export function slugifyYear(year: string): string {
	return slugify(year.toString(), { lower: true });
}

export function deslugifyYear(slug: string, years: string[]): string | undefined {
	return years.find((year) => slugifyYear(year) === slug);
}
