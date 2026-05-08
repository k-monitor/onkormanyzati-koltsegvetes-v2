import eventBus from '~/utils/eventBus';

export default createGlobalState(() => {
	const year = useState('year', () => '' + CONFIG.defaultYear);
	const initialized = useState('yearInitialized', () => false);
	const hashMode = useState<'full' | 'no-year' | 'none'>('yearHashMode', () => 'full');
	const isScrollingToSection = ref(false);

	function setHashMode(mode: 'full' | 'no-year' | 'none') {
		hashMode.value = mode;
	}

	function getInitialHashYear(): string | null {
		if (typeof window === 'undefined') return null;
		const hash = window.location.hash.slice(1);
		if (!hash) return null;
		return s2y(hash.split('/')[0] ?? '');
	}

	function clearHashFromUrl() {
		const url = window.location.pathname + window.location.search;
		if (window.location.hash) window.history.replaceState(null, '', url);
	}

	function reinitializeFromHash() {
		const { year: hashYear, section, milestoneId } = parseHash();
		if (hashYear) year.value = hashYear;
		updateHash(year.value, section, milestoneId);
		if (section) {
			isScrollingToSection.value = true;
			setTimeout(() => {
				scrollToSection(section, true);
				if (milestoneId) eventBus.emit(section === 'terkep' ? 'jump_map' : 'ms', milestoneId);
			}, 100);
			setTimeout(() => {
				isScrollingToSection.value = false;
			}, 600);
		}
	}

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

	function parseHash(): {
		year: string | null;
		section: string | null;
		milestoneId: string | null;
	} {
		if (typeof window === 'undefined') return { year: null, section: null, milestoneId: null };
		const hash = window.location.hash.slice(1);
		if (!hash) return { year: null, section: null, milestoneId: null };

		if (hashMode.value !== 'full') {
			const milestoneMatch = hash.match(/^([\w-]+)\/(.+)$/);
			if (milestoneMatch) return { year: null, section: milestoneMatch[1] ?? null, milestoneId: milestoneMatch[2] ?? null };
			return { year: null, section: hash, milestoneId: null };
		}

		// Check if hash is year-section-milestoneId format (e.g., #2024-kozponti/fejlesztesek/m1)
		const milestoneMatch = hash.match(/^([\w-]+)\/([\w-]+)\/(.+)$/);
		if (milestoneMatch) {
			const [, yearPart, sectionPart, milestoneId] = milestoneMatch;
			const yearFromSlug = s2y(yearPart);
			if (yearFromSlug) {
				return { year: yearFromSlug, section: sectionPart, milestoneId };
			}
		}

		// Check if hash is year-section format (e.g., #2024/fejlesztesek)
		const match = hash.match(/^([\w-]+)\/(.+)$/);
		if (match) {
			const [, yearPart, sectionPart] = match;
			const yearFromSlug = s2y(yearPart);
			if (yearFromSlug) {
				return { year: yearFromSlug, section: sectionPart, milestoneId: null };
			}
		}

		// Check if hash is just a year (e.g., #2024 or #2024-kozponti)
		const yearFromHash = s2y(hash.replace(/\/.*$/, '')); // Remove any trailing section/milestone part
		if (yearFromHash) {
			return { year: yearFromHash, section: null, milestoneId: null };
		}

		return { year: null, section: null, milestoneId: null };
	}

	function updateHash(
		newYear: string,
		section: string | null = null,
		milestoneId: string | null = null,
	) {
		if (typeof window === 'undefined') return;
		if (hashMode.value === 'none' || (hashMode.value === 'no-year' && !section)) {
			clearHashFromUrl();
			return;
		}
		if (hashMode.value === 'no-year') {
			let newHash = section!;
			if (milestoneId) newHash += `/${milestoneId}`;
			if (window.location.hash.slice(1) !== newHash)
				window.history.replaceState(null, '', `#${newHash}`);
			return;
		}
		let newHash = y2s(newYear);
		if (section) {
			newHash = `${newHash}/${section}`;
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

	function handleMilestoneOpened(milestoneId: string, isMap = false) {
		updateHash(year.value, isMap ? 'terkep' : 'fejlesztesek', milestoneId);
	}

	function handleMilestoneClosed(isMap = false) {
		updateHash(year.value, isMap ? 'terkep' : 'fejlesztesek');
	}

	function translateSection(section: string): string {
		const translations: Record<string, string> = {
			fejlesztesek: 'milestones',
			kiadas: 'expense',
			bevetel: 'income',
			koszonto: 'welcome',
			merleg: 'inex',
			terkep: 'map',
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
					eventBus.emit(section === 'terkep' ? 'jump_map' : 'ms', milestoneId);
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
				isScrollingToSection.value = true;
				setTimeout(() => {
					scrollToSection(section, true);
					if (milestoneId) eventBus.emit(section === 'terkep' ? 'jump_map' : 'ms', milestoneId);
				}, 100);
				setTimeout(() => {
					isScrollingToSection.value = false;
				}, 600);
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

	const canShowMap = computed(() => {
		return (
			CONFIG.modules.map &&
			Object.values(MILESTONES).filter((m) => m.year == year.value && m.position).length > 0
		);
	});

	return {
		year: readonly(year),
		hashMode: readonly(hashMode),
		isScrollingToSection: readonly(isScrollingToSection),
		setHashMode,
		getInitialHashYear,
		reinitializeFromHash,
		handleYearSelected,
		handleMilestoneOpened,
		handleMilestoneClosed,
		canShowMilestones,
		canShowMap,
	};
});
