<script setup lang="ts">
const { year } = useYear();

function intro() {
	// TODO LATER eliminate jQuery
	const $ = window.$;
	$('#mainNav').css('position', 'absolute');
	$('.milestone-button').addClass('disabled');
	const intro = window
		.introJs()
		.setOption('doneLabel', 'Kilépés')
		.setOption('hideNext', true)
		.setOption('nextLabel', 'Tovább')
		.setOption('prevLabel', 'Vissza')
		.setOption('scrollToElement', false)
		.setOption('showBullets', false)
		.setOption('showProgress', false)
		.setOption('showStepNumbers', false)
		.setOption('skipLabel', 'Kilépés')
		.setOption('tooltipPosition', 'left')
		.onbeforechange(function (targetElement: Element) {
			const step = this._introItems[this._currentStep];
			if (step.milestoneButtonStep) {
				eventBus.emit('jump', { side: 'expense', type: 'econ' });
				eventBus.emit('jump', { side: 'income', type: 'econ' });
				nextTick(() => {
					targetElement = $('.milestone-button:visible')[0];
					targetElement.classList.add('disabled', 'introjs-showElement');
					step.element = targetElement;
					step.position = 'left';
					intro.refresh();
					scrollToElement(targetElement, 160);
				});
				return;
			} else if (step.path && step.side && step.targetNode) {
				const { path, side, targetNode } = step;
				eventBus.emit('jump', {
					side,
					type: 'econ',
					path: path.split(';'),
				});
				nextTick(() => {
					targetElement = $(`.bar[data-id=${targetNode}]`)[0];
					targetElement.classList.add('introjs-showElement');
					step.element = targetElement;
					step.position = 'right';
					intro.refresh();
					scrollToElement(targetElement, 160);
				});
				return;
			} else if (targetElement.className.includes('fa-search')) {
				$('#navbarResponsive').addClass('show');
			}
			scrollToElement(targetElement, 160);
		})
		.onexit(function () {
			$('#navbarResponsive').removeClass('show');
			$('#mainNav').css('position', 'fixed');
			$('.milestone-button').removeClass('disabled');
		});

	const steps = [];

	if (CONFIG.modules.inex) {
		steps.push({
			element: '#inex-wrapper',
			intro: 'Ebben a szakaszban a költségvetés bevételeinek és kiadásainak fő számait mutatjuk be.',
			position: 'left',
		});
		steps.push({
			element: '#inex-wrapper .vis .left-column .bar:nth-child(1)',
			intro: 'Ha az egér egy hasáb fölé kerül (vagy mobilon hosszan rajta tartja az ujját), további információ jelenik meg. Próbálja ki!',
			position: 'top',
		});
	}

	const side = CONFIG.modules.income ? 'income' : 'expense';
	const el = '#' + side;
	const yearData = DATA[year] || ({} as Record<string, any>);
	const sideData = yearData[side] || ({} as Record<string, any>);
	if (sideData.func) {
		steps.push({
			element: el + ' ul',
			intro: 'A részletes bevételi és kiadási adatokat kétféle bontásban jelenítjük meg.',
			position: 'top',
		});
	}
	steps.push({
		element: el + ' .vis > div',
		intro: 'A hasábokra kattintva beléphet az adott kategóriába, a bal oldali függőleges sávval pedig vissza tud lépni.',
		position: 'right',
	});

	if (CONFIG.modules.milestones) {
		steps.push({
			milestoneButtonStep: true, // see onbeforechange above
			intro: 'Az egyes kategóriákhoz fejlesztés is kapcsolódhat. A gombra kattintva fotó és leírás jelenik meg.',
		});
	}

	steps.push({
		element: el + ' ol.breadcrumb',
		intro: 'A navigációs sáv megmutatja, hol van éppen a kategóriafában, valamint ennek segítségével vissza is tud lépni.',
		position: 'bottom',
	});

	Object.keys(CONFIG.tutorial || {}).forEach((targetNode) => {
		const text = (CONFIG.tutorial as Record<string, string>)[targetNode] || '';
		if (text.trim().length === 0) return;
		const side = targetNode[0] === 'B' ? 'income' : 'expense';
		let root = sideData.econ as BudgetNode | undefined;
		const path = [];
		for (let i = 1; i < targetNode.length - 1; i++) {
			const needle = targetNode.substring(0, i + 1);
			const n = (root?.children || []).filter((n) => n.id === needle)[0];
			if (n) {
				path.push(n.id);
				root = n;
			}
		}
		if ((root?.children || []).filter((n) => n.id === targetNode).length) {
			steps.push({
				path: path.join(';'), // introJs converts array to object, so I trick him by passing string...
				side,
				targetNode,
				intro: text,
			});
		}
	});

	steps.push({
		element: '#mainNav .fa-search',
		intro: 'A keresés funkcióval könnyedén megtalálhatja bármelyik kategóriát, akár a neve, akár hozzá kapcsolódó szavak (címkék) alapján. Lehetőség van összegre és összeg tartományra is szűrni.',
		position: 'bottom',
	});

	if (Object.keys(DATA).length > 1) {
		steps.push({
			element: '#mainNav .dropdown',
			intro: 'Az évváltó gombbal pedig a különböző évek költségvetései között válthat.',
			position: 'bottom',
		});
	}

	if (CONFIG.modules.milestones) {
		steps.push({
			element: '#milestones h2',
			intro: 'A Fejlesztések szakaszban a kiválasztott évhez kapcsolódó összes fejlesztés megtekinthető fotóval és rövid leírással.',
			position: 'bottom',
		});
	}

	steps.push({
		element: '#face',
		intro: 'Kellemes böngészést!',
		position: 'left',
	});

	intro.setOptions({ steps }).start();
}
</script>

<template>
	<section
		id="welcome"
		class="page-section bg-primary text-white"
	>
		<div class="container">
			<div class="container">
				<div class="row justify-content-center mb-5">
					<div class="col-lg-8 text-center">
						<h2>{{ CONFIG.welcome.title }}</h2>
						<hr class="divider light my-4" />
					</div>
				</div>
				<div class="row justify-content-around mb-5">
					<div class="col-lg-5 text-justify text-white-75">
						<VueMarkdown
							:source="CONFIG.welcome.leftBlock"
							:anchorAttributes="{ target: '_blank' }"
						/>
					</div>
					<div class="col-lg-5 text-justify text-white-75">
						<VueMarkdown
							:source="CONFIG.welcome.rightBlock"
							:anchorAttributes="{ target: '_blank' }"
						/>
						<p class="my-5">{{ CONFIG.welcome.aboveSignature }}</p>
						<div class="d-flex">
							<div class="my-auto w-33 d-flex align-center justify-content-center">
								<img
									class="rounded-circle"
									id="face"
									src="/assets/img/face.png"
									alt=""
									style="height: 100px"
								/>
							</div>
							<div class="flex-grow-1 ml-5">
								<p class="mt-4 mb-0">
									<em>
										{{ CONFIG.welcome.name }}
										<br />
										{{ CONFIG.welcome.role }}
									</em>
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row justify-content-center">
					<div class="col-lg-8 text-center">
						<div
							class="btn btn-outline-light btn-xl js-scroll-trigger"
							@click="intro()"
						>
							Kipróbálom!
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
@import '../scss/common';
@import '../scss/introjs-modern';

// Tooltip over Intro.js
.tooltip {
	z-index: 10000000 !important;
}
</style>
