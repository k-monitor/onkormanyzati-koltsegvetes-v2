export default createGlobalState(() => {
	const modifications = useState<Map<string, number>>('modifications', () => new Map());

	function generateKey(sheetName: string, id: string) {
		return `${sheetName}#${id}`;
	}

	function markModified(sheetName: string, id: string, previousValue: number | undefined) {
		if (!sheetName || !id || previousValue === undefined) return;
		const key = generateKey(sheetName, id);
		if (!modifications.value.has(key)) {
			// only storing last saved state
			// so not updating on every change
			modifications.value.set(key, previousValue);
		}
	}

	function markUnmodified(sheetName: string, id: string) {
		const key = generateKey(sheetName, id);
		modifications.value.delete(key);
	}

	function markAllUnmodified() {
		modifications.value.clear();
	}

	function isModified(sheetName: string, id: string): boolean {
		const key = generateKey(sheetName, id);
		return modifications.value.has(key);
	}

	function isPrefixModified(prefix: string): boolean {
		for (const key of modifications.value.keys()) {
			if (key.startsWith(prefix)) {
				return true;
			}
		}
		return false;
	}

	function isNodeTreeModified(sheetName: string, id: string) {
		// using the fact that only econ nodes are editable
		// and an econ child ID has the prefix of the parent ID
		return isPrefixModified(generateKey(sheetName, id));
	}

	function isYearModified(year: string) {
		return isPrefixModified(year);
	}

	const isBudgetModified = computed(() => modifications.value.size > 0);

	const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = true;
	};

	watch(isBudgetModified, (newValue) => {
		if (newValue) {
			window.addEventListener('beforeunload', beforeUnloadHandler);
		} else {
			window.removeEventListener('beforeunload', beforeUnloadHandler);
		}
	});

	return {
		modifications, // FIXME only for debug, remove!
		isBudgetModified,
		isYearModified,
		isNodeTreeModified,
		isModified,
		markModified,
		markUnmodified,
		markAllUnmodified,
	};
});
