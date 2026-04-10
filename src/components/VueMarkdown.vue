<script setup lang="ts">
// Based on: https://github.com/miaolz123/vue-markdown/blob/master/src/VueMarkdown.js

import markdownIt from 'markdown-it';

const { source, anchorAttributes, externalLinksNewTab } = defineProps<{
	source: string;
	anchorAttributes?: Record<string, string>;
	externalLinksNewTab?: boolean;
}>();

const md = new markdownIt();

md.set({
	html: true,
	xhtmlOut: true,
	breaks: true,
	linkify: true,
	typographer: true,
	langPrefix: 'language-',
	quotes: '\u201c\u201d\u2018\u2019',
});

function isExternalLink(href: string): boolean {
	if (!href) return false;
	// Relative links are internal
	if (href.startsWith('/') || href.startsWith('#') || href.startsWith('./') || href.startsWith('../')) {
		return false;
	}
	try {
		const url = new URL(href, window.location.origin);
		return url.origin !== window.location.origin;
	} catch {
		return false;
	}
}

let defaultLinkRenderer =
	md.renderer.rules.link_open ||
	function (tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	};

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
	const hrefIndex = tokens[idx].attrIndex('href');
	const href = hrefIndex >= 0 ? tokens[idx].attrs[hrefIndex][1] : '';
	const isExternal = isExternalLink(href);

	Object.keys(anchorAttributes || {}).map((attribute) => {
		if (externalLinksNewTab && attribute === 'target') return;

		let aIndex = tokens[idx].attrIndex(attribute);
		let value = anchorAttributes?.[attribute];
		if (aIndex < 0) {
			tokens[idx].attrPush([attribute, value]); // add new attribute
		} else {
			tokens[idx].attrs[aIndex][1] = value;
		}
	});

	// Handle target attribute based on externalLinksNewTab prop
	if (externalLinksNewTab) {
		const targetIndex = tokens[idx].attrIndex('target');
		if (isExternal) {
			if (targetIndex < 0) {
				tokens[idx].attrPush(['target', '_blank']);
			} else {
				tokens[idx].attrs[targetIndex][1] = '_blank';
			}
		} else {
			// Internal link - ensure no target="_blank"
			if (targetIndex >= 0) {
				tokens[idx].attrs[targetIndex][1] = '_self';
			}
		}
	}

	return defaultLinkRenderer(tokens, idx, options, env, self);
};

const outHtml = computed(() => md.render(source));
</script>

<template>
	<div v-html="outHtml"></div>
</template>
