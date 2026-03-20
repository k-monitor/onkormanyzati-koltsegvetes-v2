type ColumnOrder = 'name-first' | 'amount-first';
type QuoteChar = '"' | "'" | null;

interface DetectedFormat {
	separator: string;
	order: ColumnOrder;
	quoting: QuoteChar;
}

interface ParsedRow {
	name: string;
	amount: number;
}

export default (lines: string[]): ParsedRow[] => {
	if (!lines || lines.length === 0) return [];

	// --- Format detection helpers ---

	const SEPARATORS = ['|', '\t', ';'] as const;

	// Detect which separator is present in the first line (priority order)
	function detectSeparator(line: string): string | null {
		return SEPARATORS.find((sep) => line.includes(sep)) ?? null;
	}

	// Strip matching surrounding quotes or apostrophes from a value
	function unquote(value: string): string {
		const v = value.trim();
		if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
			return v.slice(1, -1).trim();
		}
		return v;
	}

	// Amount: digits with optional thousand separators (spaces or commas)
	// Valid examples: "1000", "1 000", "1,000", "1 000 000"
	const AMOUNT_RE = /^[\d]+(?:[,\s]\d{3})*$/;

	function isAmount(value: string): boolean {
		return AMOUNT_RE.test(value);
	}

	// Parse a validated amount string to a number
	function parseAmount(value: string): number {
		return parseInt(value.replace(/[,\s]/g, ''), 10);
	}

	// Detect column order: returns 'name-first' or 'amount-first' or null
	function detectOrder(parts: string[]): ColumnOrder | null {
		if (parts.length !== 2) return null;
		const [a, b] = parts.map(unquote);
		if (!isAmount(a) && isAmount(b)) return 'name-first';
		if (isAmount(a) && !isAmount(b)) return 'amount-first';
		return null; // ambiguous or invalid
	}

	// Detect quoting style from the raw parts of the first line
	function detectQuoting(parts: string[]): QuoteChar {
		const trimmed = parts.map((p: string) => p.trim());
		const allQuoted = trimmed.every((p) => p.startsWith('"') && p.endsWith('"'));
		const allApostrophed = trimmed.every((p) => p.startsWith("'") && p.endsWith("'"));
		if (allQuoted) return '"';
		if (allApostrophed) return "'";
		return null;
	}

	// --- Format detection from the first line ---

	const firstLine = lines[0];
	const separator = detectSeparator(firstLine);
	if (!separator) return [];

	const firstParts = firstLine.split(separator);
	const order = detectOrder(firstParts);
	if (!order) return [];

	const quoting: QuoteChar = detectQuoting(firstParts);

	// Expose detected format for debugging/logging if needed
	const _format: DetectedFormat = { separator, order, quoting };

	// --- Build a regex to validate each line against the detected format ---

	const sepEscaped = separator.replace(/[|\\]/g, '\\$&');

	function makeValuePattern(): string {
		if (quoting) {
			const q = quoting === '"' ? '"' : "'";
			return `${q}[^${q}]*${q}`;
		}
		return `[^${sepEscaped}]+`;
	}

	const valPat = makeValuePattern();
	const lineRegex = new RegExp(`^\\s*(${valPat})\\s*${sepEscaped}\\s*(${valPat})\\s*$`);

	// --- Parse all lines ---

	const results: ParsedRow[] = [];

	for (const line of lines) {
		const match = lineRegex.exec(line);
		if (!match) continue;

		const rawA = unquote(match[1]);
		const rawB = unquote(match[2]);

		const [nameVal, amountRaw]: [string, string] =
			order === 'name-first' ? [rawA, rawB] : [rawB, rawA];

		if (!isAmount(amountRaw)) continue;

		results.push({
			name: nameVal,
			amount: parseAmount(amountRaw),
		});
	}

	return results;
};
