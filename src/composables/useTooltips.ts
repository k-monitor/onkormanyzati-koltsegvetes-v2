export function useTooltips() {
	function regenerateTooltips() {
		const $ = window.$;
		const isTouchDevice = window.matchMedia('(hover: none)').matches;

		if (!isTouchDevice) {
			$('[data-toggle="tooltip"]').tooltip();
			return;
		}

		// Don't reinitialize while a tooltip is visible — Bootstrap appending the
		// tooltip div triggers onUpdated, which would immediately dispose it
		if (document.querySelector('.tooltip')) return;

		// Destroy existing instances to avoid duplicate handlers on re-render
		$('[data-toggle="tooltip"]').tooltip('dispose');

		// Manual trigger — we control show/hide via custom long-press logic
		$('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });

		$('[data-toggle="tooltip"]').each(function () {
			const el = this as HTMLElement;
			let timer: ReturnType<typeof setTimeout> | null = null;
			let tooltipShown = false;

			el.addEventListener('touchstart', () => {
				tooltipShown = false;
				timer = setTimeout(() => {
					timer = null;
					tooltipShown = true;
					$(el).tooltip('show');
				}, 500);
			});

			el.addEventListener('touchmove', () => {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
			});

			el.addEventListener('touchend', () => {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				// Register dismiss listener only after the long press is confirmed and
				// touchend has fired, so the current event chain can't trigger it
				if (tooltipShown) {
					document.addEventListener('touchstart', () => $(el).tooltip('hide'), {
						once: true,
					});
				}
			});

			// Suppress click after a long press so the tooltip stays visible
			// and navigation is not triggered unintentionally
			el.addEventListener(
				'click',
				(e) => {
					if (tooltipShown) {
						e.preventDefault();
						e.stopPropagation();
						tooltipShown = false;
					}
				},
				{ capture: true },
			);
		});
	}

	return { regenerateTooltips };
}
