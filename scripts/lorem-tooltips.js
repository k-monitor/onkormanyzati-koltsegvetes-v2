const fs = require('fs');

let ids = {};

function gatherIds(node) {
	if (!node) return;
	if (node.altId) {
		ids[node.id] = `Lorem ipsum for ${node.id}`;
		ids[node.altId] = `Lorem ipsum for ${node.altId}`;
	}
	if (node.children) {
		node.children.forEach(gatherIds);
	}
}

const data = JSON.parse(fs.readFileSync('./src/data/data.json'));
Object.values(data).forEach(year => {
	Object.values(year).forEach(side => {
		Object.values(side).forEach(root => {
			gatherIds(root);
		});
	});
});

fs.writeFileSync('./src/data/lorem-tooltips.json', JSON.stringify(ids, null, 2));
