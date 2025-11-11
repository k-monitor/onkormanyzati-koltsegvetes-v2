import fs from 'fs';

const data = JSON.parse(fs.readFileSync('app/data/data.json', { encoding: 'utf8' }));

Object.keys(data).forEach((year) => {
	['expense', 'income'].forEach((side) => {
		const root = data[year][side].econ;
		validateSum(root, year);
	});
});

function validateSum(node, year) {
	if (node.children && node.children.length) {
		const childrensSum = node.children
			.filter((n) => !(n.id || '').startsWith('F'))
			.map((n) => n.value)
			.reduce((sum, v) => sum + v, 0);
		if (node.value !== childrensSum) {
			printInvalidNode(node, year, childrensSum);
		}
		node.children.forEach((n) => validateSum(n, year));
	}
}

function printInvalidNode(node, year, childrensSum) {
	print(`Összeg nem jön ki (${year}):`);
	printNode(node);

	const diff = childrensSum - node.value;
	const plus = diff > 0 ? '+' : '';
	print('Gyerek node-ok összege:');
	print(
		`\t${''.padEnd(10)}  ${groupNums(childrensSum).padStart(25)} (${plus}${groupNums(diff)})`,
	);

	print('Gyerek node-ok tételesen:');
	node.children.forEach((n) => printNode(n));
	print('');
}

function printNode(node) {
	print(`\t${(node.id || '').padEnd(10)}  ${groupNums(node.value).padStart(25)}  ${node.name}`);
}

function print(...message) {
	console.error('[KÖKÖ]', ...message);
}

function groupNums(v, ns, suffixes) {
	// copy from main.js
	suffixes = suffixes || ['', 'e', 'M', 'Mrd'];
	var i = 0;
	v = Number(v);
	var neg = v < 0;
	v = Math.abs(v);
	while (ns && i < suffixes.length - 1 && v > 1000) {
		v /= 1000;
		i++;
	}
	v = Math.round(v * 10) / 10;
	if (ns) v = v.toFixed(1);
	var vs = (v + '').replace(/\./g, ',').replace(/\d(?=(?:\d{3})+(?:,|$))/g, function ($0, i) {
		return $0 + ' ';
	});
	return (neg ? '-' : '') + (vs + ' ' + suffixes[i] + ' Ft').trim();
}
