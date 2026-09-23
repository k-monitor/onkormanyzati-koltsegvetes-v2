// Runs `callback` at most once per animation frame while the page scrolls, and
// removes the listener when the component unmounts.
//
// Plain `scroll` listeners fire many times per frame and, when they read layout
// or change background positions, make Firefox (which scrolls asynchronously on
// the compositor) stutter. Listeners added without cleanup also pile up every
// time a page is revisited.
export default (callback: () => void) => {
	let frame = 0;

	function onScroll() {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			callback();
		});
	}

	onMounted(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		callback();
	});

	onUnmounted(() => {
		window.removeEventListener('scroll', onScroll);
		if (frame) cancelAnimationFrame(frame);
	});
};
