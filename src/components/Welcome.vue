<template>
	<section class="page-section bg-primary text-white">
		<div class="container">
			<div class="container">
				<div class="row justify-content-center mb-5">
					<div class="col-lg-8 text-center">
						<h2>{{ $config.welcome.title }}</h2>
						<hr class="divider light my-4">
					</div>
				</div>
				<div class="row justify-content-around mb-5">
					<div class="col-lg-5 text-justify text-white-75">
						<VueMarkdown :source="$config.welcome.leftBlock" />
					</div>
					<div class="col-lg-5 text-justify text-white-75">
						<VueMarkdown :source="$config.welcome.rightBlock" />
						<p class="my-5">{{ $config.welcome.aboveSignature }}</p>
						<div class="d-flex">
							<div class="my-auto w-33 d-flex align-center justify-content-center">
								<img
									class="rounded-circle"
									id="face"
									src="assets/img/face.png"
									alt=""
									style="height: 100px;"
								>
							</div>
							<div class="flex-grow-1 ml-5">
								<p class="mt-4 mb-0">
									<em>
										{{ $config.welcome.name }},
										<br>
										{{ $config.welcome.role }}
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
						>Kipróbálom!</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import config from "~/data/config.json";

export default {
	props: ["year"],
	methods: {
		intro() {
			$("#mainNav").css("position", "absolute");
			$(".milestone-button").addClass("disabled");
			const intro = introJs()
				.setOption("doneLabel", "Kilépés")
				.setOption("nextLabel", "Tovább")
				.setOption("prevLabel", "Vissza")
				.setOption("scrollToElement", false)
				.setOption("showBullets", false)
				.setOption("showProgress", false)
				.setOption("showStepNumbers", false)
				.setOption("skipLabel", "Kilépés")
				.setOption("tooltipPosition", "left")
				.onbeforechange(function (targetElement) {
					if (targetElement.className.includes("fa-search")) {
						$("#navbarResponsive").addClass("show");
					}
					$("html, body").animate(
						{
							scrollTop: $(targetElement).offset().top - 160,
						},
						1000,
						"easeInOutExpo"
					);
				})
				.onexit(function () {
					$("#navbarResponsive").removeClass("show");
					$("#mainNav").css("position", "fixed");
					$(".milestone-button").removeClass("disabled");
				});

			const steps = [];
			if (config.modules.inex) {
				steps.push({
					element: "#inex-wrapper",
					intro:
						"Ebben a szakaszban a költségvetés bevételeinek és kiadásainak fő számait mutatjuk be.",
					position: "left",
				});
				steps.push({
					element: "#inex-wrapper .vis .left-column .bar:nth-child(1)",
					intro:
						"Ha az egér egy hasáb fölé kerül (vagy mobilon hosszan rajta tartja az ujját), további információ jelenik meg. Próbálja ki!",
					position: "top",
				});
			}

			const el = config.modules.income ? "#income" : "#expense";
			if (this.$d[this.year][el.substring(1)].func) {
				steps.push({
					element: el + " ul",
					intro:
						"A részletes bevételi és kiadási adatokat kétféle bontásban jelenítjük meg.",
					position: "top",
				});
			}
			steps.push({
				element: el + " .vis > div",
				intro:
					"A hasábokra kattintva beléphet az adott kategóriába, a bal oldali függőleges sávval pedig vissza tud lépni.",
				position: "right",
			});

			const mb = $(".milestone-button");
			if (config.modules.milestones && mb.length > 0) {
				steps.push({
					element: ".milestone-button",
					intro:
						"Az egyes kategóriákhoz fejlesztés is kapcsolódhat. A gombra kattintva fotó és leírás jelenik meg.",
					position: "left",
				});
			}

			steps.push({
				element: el + " ol.breadcrumb",
				intro:
					"A navigációs sáv megmutatja, hol van éppen a kategóriafában, valamint ennek segítségével vissza is tud lépni.",
				position: "bottom",
			});

			steps.push({
				element: "#mainNav .fa-search",
				intro:
					"A keresés funkcióval könnyedén megtalálhatja bármelyik kategóriát, akár a neve, akár hozzá kapcsolódó szavak (címkék) alapján.",
				position: "bottom",
			});

			if (Object.keys(this.$d).length > 1) {
				steps.push({
					element: "#mainNav .dropdown",
					intro:
						"Az évváltó gombbal pedig a különböző évek költségvetései között válthat.",
					position: "bottom",
				});
			}

			if (config.modules.milestones) {
				steps.push({
					element: "#milestones h2",
					intro:
						"A Fejlesztések szakaszban a kiválasztott évhez kapcsolódó összes fejlesztés megtekinthető fotóval és rövid leírással.",
					position: "bottom",
				});
			}

			steps.push({
				element: "#face",
				intro: "Kellemes böngészést!",
				position: "left",
			});

			intro.setOptions({ steps }).start();
		},
	},
};
</script>

<style lang="scss">
@import "../scss/common";
@import "../scss/introjs-modern";

// Tooltip over Intro.js
.tooltip {
	z-index: 10000000 !important;
}
</style>
