export default () => {
	const { year, hashMode, isScrollingToSection, isMilestoneOpen } = useYear();

	// Section slug to element ID mapping
	const sectionToElementId: Record<string, string> = {
		koszonto: 'welcome',
		merleg: 'inex',
		bevetel: 'income',
		kiadas: 'expense',
		'idosor-bevetel': 'time-series-income',
		'idosor-kiadas': 'time-series-expense',
		fejlesztesek: 'milestones',
		terkep: 'map',
	};

	// Element ID to section slug mapping (reverse)
	const elementIdToSection: Record<string, string> = {
		welcome: 'koszonto',
		inex: 'merleg',
		income: 'bevetel',
		expense: 'kiadas',
		'time-series-income': 'idosor-bevetel',
		'time-series-expense': 'idosor-kiadas',
		milestones: 'fejlesztesek',
		map: 'terkep',
	};

	// Sections that should highlight the költségvetés nav item
	const budgetSections = [
		'inex',
		'income',
		'expense',
		'time-series-income',
		'time-series-expense',
	];

	// Track the current active section to avoid unnecessary URL updates
	let currentActiveSection: string | null = null;
	// Flag to prevent URL updates when scrolling was triggered by navigation
	let isNavigationScroll = false;
	let navigationScrollTimeout: ReturnType<typeof setTimeout> | null = null;

	function setNavigationScroll() {
		isNavigationScroll = true;
		if (navigationScrollTimeout) {
			clearTimeout(navigationScrollTimeout);
		}
		// Reset the flag after scrolling animation completes
		navigationScrollTimeout = setTimeout(() => {
			isNavigationScroll = false;
		}, 1000);
	}

	function getActiveSection(): string | null {
		const offset = 100;
		const sections = Object.values(sectionToElementId);

		for (const sectionId of sections) {
			const element = document.getElementById(sectionId);
			if (element) {
				const rect = element.getBoundingClientRect();
				if (rect.top <= offset && rect.bottom > offset) {
					return sectionId;
				}
			}
		}

		// Check if we're above the first section (masthead area)
		const welcomeElement = document.getElementById('welcome');
		if (welcomeElement) {
			const rect = welcomeElement.getBoundingClientRect();
			if (rect.top > offset) {
				return 'masthead'; // Special value for top of page
			}
		}

		return null;
	}

	function updateUrlForSection(activeSection: string | null) {
		if (
			!activeSection ||
			isNavigationScroll ||
			isScrollingToSection.value ||
			isMilestoneOpen.value
		)
			return;

		if (hashMode.value === 'none') return;

		if (hashMode.value === 'no-year') {
			if (activeSection === 'masthead') {
				const url = window.location.pathname + window.location.search;
				if (window.location.hash) window.history.replaceState(null, '', url);
				return;
			}
			const sectionSlug = elementIdToSection[activeSection];
			if (!sectionSlug) return;
			if (window.location.hash.slice(1) !== sectionSlug)
				window.history.replaceState(null, '', `#${sectionSlug}`);
			return;
		}

		let newHash: string;
		if (activeSection === 'masthead') {
			newHash = `${slugify(year.value)}/`;
		} else {
			const sectionSlug = elementIdToSection[activeSection];
			if (!sectionSlug) return;
			newHash = `${slugify(year.value)}/${sectionSlug}`;
		}

		const currentHash = window.location.hash.slice(1);
		if (currentHash !== newHash) {
			window.history.replaceState(null, '', `#${newHash}`);
		}
	}

	function onScroll() {
		const activeSection = getActiveSection();

		// Update URL if section changed
		if (activeSection !== currentActiveSection) {
			currentActiveSection = activeSection;
			updateUrlForSection(activeSection);
		}
	}

	function init() {
		window.addEventListener('scroll', onScroll);
		setTimeout(onScroll, 0);
	}

	function destroy() {
		window.removeEventListener('scroll', onScroll);
		if (navigationScrollTimeout) {
			clearTimeout(navigationScrollTimeout);
		}
	}

	return {
		init,
		destroy,
		setNavigationScroll,
		sectionToElementId,
		elementIdToSection,
	};
};
