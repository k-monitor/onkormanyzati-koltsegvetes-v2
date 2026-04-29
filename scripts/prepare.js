import prepareFunctions from './prepare-functions.js';
import prepareConfig from './prepare-config.js';
import prepareData from './prepare-data.js';
import prepareMilestones from './prepare-milestones.js';
import prepareTags from './prepare-tags.js';
import prepareTooltips from './prepare-tooltips.js';
import prepareDownloads from './prepare-downloads.js';
import prepareStyle from './prepare-style.js';
import validateData from './validate-data.js';

(async () => {
	// IN: scripts/default-functions.tsv
	// IN: input/config.xlsx
	// OUT: src/data/functions.tsv
	prepareFunctions();

	// IN: input/config.xlsx
	// OUT: src/data/config.json
	prepareConfig();

	// IN: input/budget.xlsx
	// IN: src/data/functions.tsv
	// OUT: src/data/data.json
	await prepareData();

	// IN: input/config.xlsx
	// OUT: src/data/milestones.json
	prepareMilestones();

	// IN: input/tags.xlsx
	// OUT: src/data/tags.json
	prepareTags();

	// IN: input/config.xlsx
	// OUT: src/data/tooltips.json
	prepareTooltips();

	// IN: src/favicon.png
	// OUT: static/assets/img/favicon.png
	prepareDownloads();

	// IN: src/data/config.json
	// IN: src/data/data.json
	// OUT: src/scss/_generated.scss
	prepareStyle();

	validateData();
})();

// TODO LATER refactor these to use ExcelJS instead of SheetJS (xlsx) - example in prepare-data
// TODO LATER refactor these into TS
