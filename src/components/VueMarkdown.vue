<script setup lang="ts">
// Based on: https://github.com/miaolz123/vue-markdown/blob/master/src/VueMarkdown.js

import markdownIt from 'markdown-it';

const { source, anchorAttributes } = defineProps<{
	source: string;
	anchorAttributes?: Record<string, string>;
}>();

const md = new markdownIt();

md.set({
	html: true,
	xhtmlOut: true,
	breaks: true,
	linkify: true,
	typographer: true,
	langPrefix: 'language-',
	quotes: '“”‘’',
});

let defaultLinkRenderer =
	md.renderer.rules.link_open ||
	function (tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	};

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
	Object.keys(anchorAttributes || {}).map((attribute) => {
		let aIndex = tokens[idx].attrIndex(attribute);
		let value = anchorAttributes?.[attribute];
		if (aIndex < 0) {
			tokens[idx].attrPush([attribute, value]); // add new attribute
		} else {
			tokens[idx].attrs[aIndex][1] = value;
		}
	});
	return defaultLinkRenderer(tokens, idx, options, env, self);
};

let outHtml = md.render(source);
</script>

<template>
	<div v-html="outHtml"></div>
</template>
