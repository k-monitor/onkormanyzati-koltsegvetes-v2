const fs = require('fs');

let ids = {};

function gatherIds(node) {
	if (!node) return;
	ids[node.id] = `Lorem ipsum for ${node.id}`;
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
