import config from '~/data/config.json'; // import is needed because metaInfo below cannot
import data from '~/data/data.json';

export default () => {
	const year = useState('year', () => '' + config.defaultYear);

	function handleYearSelected(_year: string) {
		if (Object.hasOwn(data, _year)) year.value = _year;
	}

	return {
		year: readonly(year),
		handleYearSelected,
	};
};
