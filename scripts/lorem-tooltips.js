const fs = require('fs');
const fg = require('fast-glob');

let altIds = {};

function gatherAltIds(node) {
	if (node.altId) {
		altIds[node.altId] = true;
	}
	if (node.children) {
		node.children.forEach(gatherAltIds);
	}
}

fg.sync(['data/**/*.json'])
	.map(fn => fs.readFileSync(fn, 'utf-8'))
	.map(raw => JSON.parse(raw))
	.forEach(gatherAltIds);

const output = Object.keys(altIds).sort().map(altId => `${altId}\tLorem ipsum for ${altId}`).join('\n');
fs.writeFileSync('data/lorem-tooltips.tsv', output);
