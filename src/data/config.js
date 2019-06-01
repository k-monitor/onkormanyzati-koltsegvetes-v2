const city = 'Mintaváros';

const title = `${city} költségvetése`;

const headline = `Ezen az oldalon megtekintheted ${city} költségvetését és fejlesztéseit, átlátható módon, interaktív vizualizációk segítségével!`;
const headerAction = 'Tovább';

const navLinks = [
	{ href: '#welcome', text: 'Köszöntő' },
	{ href: '#inex', text: 'Költségvetés' },
	{ href: '#milestones', text: 'Fejlesztések' }
];

const years = [
	2019,
	2018
]; // TODO this should be defined in the data instead

module.exports = {
	city,
	title,
	headline,
	headerAction,
	navLinks,
	years
};
