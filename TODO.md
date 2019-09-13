- prepare data:
	- work from functions.json, remove functions.tsv
	- do not generate intermediate JSONs, build data bundle on-the-fly
	- convert milestones too
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

- fix icon spaces differ
- make images static + use g-image