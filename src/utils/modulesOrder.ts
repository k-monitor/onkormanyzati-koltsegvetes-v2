import defaultConfig from '../../scripts/default-config.json';

// Ordered list of modules to render
export const MODULES_ORDER = (CONFIG.modules?.order || defaultConfig.modules.order)
	.split(',')
	.map((m: string) => m.trim())
	.filter(Boolean);
