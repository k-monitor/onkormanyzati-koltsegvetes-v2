export function useTooltips() {
	const $ = () => window.$;

	// Lightweight init — safe to call on every onUpdated.
	// Only initializes elements that haven't been set up yet.
	function regenerateTooltips() {
		const isTouchDevice = window.matchMedia('(hover: none)').matches;

		if (!isTouchDevice) {
			// trigger: 'hover' only (not 'hover focus') — these tooltips sit on
			// clickable controls (nav pills, mode buttons, bars). With the default
			// 'focus' trigger the tip stays visible after a click keeps the element
			// focused, leaving it stuck on screen.
			$()('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
			return;
		}

		// Don't reinitialize while a tooltip is visible — Bootstrap appending the
		// tooltip div triggers onUpdated, which would immediately dispose it
		if (document.querySelector('.tooltip')) return;

		initTouchTooltips();
	}

	// Full reinit — disposes existing instances so Bootstrap re-reads updated
	// :title values. Call this (via nextTick) after the year prop changes.
	function reinitTooltips() {
		$()('[data-toggle="tooltip"]').tooltip('dispose');
		// Remove any orphaned tooltip divs left behind when their source element
		// was removed from the DOM (e.g. an SVG bar) while the tip was visible.
		$()('.tooltip').remove();
		const isTouchDevice = window.matchMedia('(hover: none)').matches;
		if (isTouchDevice) {
			initTouchTooltips();
		} else {
			$()('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
		}
	}

	function initTouchTooltips() {
		// Manual trigger — we control show/hide via custom long-press logic
		$()('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });

		$()('[data-toggle="tooltip"]').each(function () {
			const el = this as HTMLElement;
			let timer: ReturnType<typeof setTimeout> | null = null;
			let tooltipShown = false;

			el.addEventListener('touchstart', () => {
				tooltipShown = false;
				timer = setTimeout(() => {
					timer = null;
					tooltipShown = true;
					$()(el).tooltip('show');
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
					document.addEventListener('touchstart', () => $()(el).tooltip('hide'), {
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

	return { regenerateTooltips, reinitTooltips };
}
