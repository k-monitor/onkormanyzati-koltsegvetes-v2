export default (v: string | number, ns?: boolean, suffixes?: string[]) => {
	suffixes = suffixes || ['', 'e', 'M', 'Mrd'];
	let i = 0;
	v = Number(v);
	const neg = v < 0;
	v = Math.abs(v);
	while (ns && i < suffixes.length - 1 && v > 1000) {
		v /= 1000;
		i++;
	}
	v = Math.round(v * 10) / 10;
	if (ns) v = v.toFixed(1);
	const vs = (v + '').replace(/\./g, ',').replace(/\d(?=(?:\d{3})+(?:,|$))/g, ($0) => $0 + ' ');
	return (neg ? '-' : '') + (vs + ' ' + suffixes[i] + ' Ft').trim();
};
