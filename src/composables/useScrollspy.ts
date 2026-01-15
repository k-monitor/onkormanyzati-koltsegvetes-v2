export default () => {
	const { year } = useYear();

	// Section slug to element ID mapping
	const sectionToElementId: Record<string, string> = {
		koszonto: 'welcome',
		merleg: 'inex',
		bevetel: 'income',
		kiadas: 'expense',
		fejlesztesek: 'milestones',
		terkep: 'map',
	};

	// Element ID to section slug mapping (reverse)
	const elementIdToSection: Record<string, string> = {
		welcome: 'koszonto',
		inex: 'merleg',
		income: 'bevetel',
		expense: 'kiadas',
		milestones: 'fejlesztesek',
		map: 'terkep',
	};

	// Sections that should highlight the költségvetés nav item
	const budgetSections = ['inex', 'income', 'expense'];

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

	function updateActiveNavLink(activeSection: string | null) {
		document.querySelectorAll('#mainNav .nav-link').forEach((link) => {
			link.classList.remove('active');
			const href = link.getAttribute('href');
			if (href && activeSection) {
				// Extract section from href (e.g., #2024/koszonto -> koszonto)
				const match = href.match(/^#[\w-]+\/(.+)$/);
				if (match) {
					const sectionSlug = match[1];
					const elementId = sectionToElementId[sectionSlug];
					// For budget sections (inex, income, expense), highlight the merleg/bevetel/kiadas nav item
					const isBudgetNavItem =
						sectionSlug === 'merleg' || sectionSlug === 'bevetel' || sectionSlug === 'kiadas';
					const isActiveBudgetSection = budgetSections.includes(activeSection);
					if ((isBudgetNavItem && isActiveBudgetSection) || elementId === activeSection) {
						link.classList.add('active');
					}
				}
			}
		});
	}

	function updateUrlForSection(activeSection: string | null) {
		if (!activeSection || isNavigationScroll) return;

		let newHash: string;
		if (activeSection === 'masthead') {
			// At the top of the page, just use year with trailing slash
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

		// Update nav link highlighting
		updateActiveNavLink(activeSection);

		// Update URL if section changed
		if (activeSection !== currentActiveSection) {
			currentActiveSection = activeSection;
			updateUrlForSection(activeSection);
		}
	}

	function init() {
		window.addEventListener('scroll', onScroll);
		// Initial update
		onScroll();
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
