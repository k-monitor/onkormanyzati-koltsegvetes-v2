import eventBus from '~/utils/eventBus';

export default () => {
	const year = useState('year', () => '' + CONFIG.defaultYear);
	const initialized = useState('yearInitialized', () => false);

	function y2s(year: string): string {
		return slugify(year);
	}

	function s2y(slug: string): string | null {
		for (const y of Object.keys(DATA)) {
			if (y2s(y) === slug) {
				return y;
			}
		}
		return null;
	}

	function parseHash(): { year: string | null; section: string | null; milestoneId: string | null } {
		if (typeof window === 'undefined') return { year: null, section: null, milestoneId: null };
		const hash = window.location.hash.slice(1);
		if (!hash) return { year: null, section: null, milestoneId: null };

		// Check if hash is just a year (e.g., #2024)
		if (Object.hasOwn(DATA, hash)) {
			return { year: hash, section: null, milestoneId: null };
		}

		// Check if hash is year-section-milestoneId format (e.g., #2024-kozponti/fejlesztesek/m1)
		const milestoneMatch = hash.match(/^([\w-]+)\/(fejlesztesek)\/(.+)$/);
		if (milestoneMatch) {
			const [, yearPart, , milestoneId] = milestoneMatch;
			if (Object.hasOwn(DATA, yearPart)) {
				return { year: s2y(yearPart), section: 'fejlesztesek', milestoneId };
			}
		}

		// Check if hash is year-section format (e.g., #2024-fejlesztesek)
		const match = hash.match(/^([\w-]+)\/(.+)$/);
		if (match) {
			const [, yearPart, sectionPart] = match;
			if (Object.hasOwn(DATA, yearPart)) {
				return { year: s2y(yearPart), section: sectionPart, milestoneId: null };
			}
		}

		return { year: null, section: hash, milestoneId: null };
	}

	function updateHash(newYear: string, section: string | null = null, milestoneId: string | null = null) {
		if (typeof window === 'undefined') return;
		let newHash = newYear;
		if (section) {
			newHash = `${y2s(newYear)}/${section}`;
			if (milestoneId) {
				newHash = `${newHash}/${milestoneId}`;
			}
		}
		const currentHash = window.location.hash.slice(1);
		if (currentHash !== newHash) {
			window.history.replaceState(null, '', `#${newHash}`);
		}
	}

	function handleYearSelected(_year: string) {
		if (Object.hasOwn(DATA, _year)) {
			year.value = _year;
			const { section } = parseHash();
			updateHash(_year, section);
		}
	}

	function handleMilestoneOpened(milestoneId: string) {
		updateHash(year.value, 'fejlesztesek', milestoneId);
	}

	function handleMilestoneClosed() {
		updateHash(year.value, 'fejlesztesek');
	}

	function translateSection(section: string): string {
		const translations: Record<string, string> = {
			'fejlesztesek': 'milestones',
			'kiadas': 'expense',
			'bevetel': 'income',
			'koszonto': 'welcome',
			'merleg': 'inex',
		};
		return translations[section] || section;
	}

	function scrollToSection(section: string, instant = false) {
		if (typeof window === 'undefined') return;
		const element = document.getElementById(translateSection(section));
		if (element) {
			element.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' });
		}
	}

	function onHashChange() {
		const { year: newYear, section, milestoneId } = parseHash();
		if (newYear && newYear !== year.value) {
			year.value = newYear;
		}
		if (section) {
			// Use setTimeout to ensure DOM is updated after year change
			setTimeout(() => {
				scrollToSection(section);
				if (milestoneId) {
					eventBus.emit('ms', milestoneId);
				}
			}, 100);
		}
	}

	// Initialize year from hash on mount and watch for hash changes
	onMounted(() => {
		if (!initialized.value) {
			const { year: hashYear, section, milestoneId } = parseHash();
			if (hashYear) {
				year.value = hashYear;
			}
			updateHash(year.value, section, milestoneId);
			if (section) {
				setTimeout(() => {
					scrollToSection(section, true);
					if (milestoneId) {
						eventBus.emit('ms', milestoneId);
					}
				}, 100);
			}
			initialized.value = true;
		}
		window.addEventListener('hashchange', onHashChange);
	});

	onUnmounted(() => {
		window.removeEventListener('hashchange', onHashChange);
	});

	const canShowMilestones = computed(() => {
		return (
			CONFIG.modules.milestones &&
			Object.values(MILESTONES).filter((m) => m.year == year.value).length > 0
		);
	});

	return {
		year: readonly(year),
		handleYearSelected,
		handleMilestoneOpened,
		handleMilestoneClosed,
		canShowMilestones,
	};
};
