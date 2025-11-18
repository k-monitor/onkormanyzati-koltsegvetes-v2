import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt([
	{
		rules: {
			'no-var': 'error',
			'prefer-const': 'error',
			'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
			'vue/padding-line-between-blocks': ['error', 'always'],
		},
	},
]);
