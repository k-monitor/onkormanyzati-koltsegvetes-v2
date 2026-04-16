export function useTooltips() {
	function regenerateTooltips() {
		const $ = window.$;
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		if (!isTouchDevice) {
			$('[data-toggle="tooltip"]').tooltip();
			return;
		}

		// Destroy existing instances to avoid duplicate handlers on re-render
		$('[data-toggle="tooltip"]').tooltip('dispose');

		// Manual trigger — we control show/hide via custom long-press logic
		$('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });

		$('[data-toggle="tooltip"]').each(function () {
			const el = this as HTMLElement;
			let timer: ReturnType<typeof setTimeout> | null = null;
			let moved = false;

			el.addEventListener(
				'touchstart',
				(e: TouchEvent) => {
					moved = false;
					timer = setTimeout(() => {
						// Prevent iOS context menu / text selection triggered by long press
						e.preventDefault();
						$(el).tooltip('show');
						// Dismiss on next tap anywhere
						document.addEventListener('touchstart', () => $(el).tooltip('hide'), {
							once: true,
						});
					}, 500);
				},
				{ passive: false },
			);

			el.addEventListener('touchmove', () => {
				moved = true;
				if (timer) clearTimeout(timer);
			});

			el.addEventListener('touchend', () => {
				if (!moved && timer) clearTimeout(timer);
				timer = null;
			});
		});
	}

	return { regenerateTooltips };
}
