export default (element: Element, offset = 0) => {
	// TODO LATER eliminate jQuery
	const $ = window.$;
	$('html, body').animate(
		{
			scrollTop: $(element).offset().top - offset,
		},
		1000,
		'easeInOutExpo',
	);
};
