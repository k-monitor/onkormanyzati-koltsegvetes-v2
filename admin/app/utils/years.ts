import slugify from 'slugify';

export function isValidYear(year: string) {
	return !!year.match(/^\d{4}/);
}

export function slugifyYear(year: string): string {
	return slugify(year.toString(), { lower: true });
}

export function deslugifyYear(slug: string, years: string[]): string | undefined {
	return years.find((year) => slugifyYear(year) === slug);
}
