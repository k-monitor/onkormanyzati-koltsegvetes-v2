export default () => {
	const year = useState('year', () => '' + CONFIG.defaultYear);

	function handleYearSelected(_year: string) {
		if (Object.hasOwn(DATA, _year)) year.value = _year;
	}

	const canShowMilestones = computed(() => {
		return (
			CONFIG.modules.milestones &&
			Object.values(MILESTONES).filter((m) => m.year == year.value).length > 0
		);
	});

	return {
		year: readonly(year),
		handleYearSelected,
		canShowMilestones,
	};
};
