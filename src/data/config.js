const city = 'Mintaváros';

const title = `${city} költségvetése`;

const headline = `Ezen az oldalon megtekintheted ${city} költségvetését és fejlesztéseit, átlátható módon, interaktív vizualizációk segítségével!`;
const headerAction = 'Tovább';

const navLinks = [
	{ href: '#welcome', text: 'Köszöntő' },
	{ href: '#inex', text: 'Költségvetés' },
	{ href: '#milestones', text: 'Fejlesztések' }
];

const defaultYear = 2018;

module.exports = {
	city,
	defaultYear,
	title,
	headline,
	headerAction,
	navLinks
};
