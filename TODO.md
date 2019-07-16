- prepare data:
	- do not generate intermediate JSONs, build data bundle on-the-fly
	- input file name should be constant like "budget.xlsx"
	- convert milestones too (tags and tooltips can be fixed)
	- remove from package.json scripts
	- adjust README
	- convert it to module and call it in beforeBuild (gridsome.server.js):

```js
module.exports = function (api, options) {
  api.beforeBuild(() => {
	// do preparation
  });
}
```

- create 'master-tapio' branch with actual xlsx file

- fix icon spaces differ
- make images static + use g-image