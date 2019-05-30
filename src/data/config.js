const city = 'Mintaváros';

const title = `${city} költségvetése`;

const headline = `Ezen az oldalon megtekintheted ${city} költségvetését és fejlesztéseit, átlátható módon, interaktív vizualizációk segítségével!`;
const headerAction = 'Tovább';

const navLinks = [
	{ href: '#welcome', text: 'Köszöntő' },
	{ href: '#inex', text: 'Költségvetés' },
	{ href: '#milestones', text: 'Fejlesztések' }
];

module.exports = {
	city,
	title,
	headline,
	headerAction,
	navLinks
};
