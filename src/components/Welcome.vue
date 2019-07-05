<template>
	<section class="page-section bg-primary text-white">
		<div class="container">
			<div class="container">
				<div class="row justify-content-center mb-5">
					<div class="col-lg-8 text-center">
						<h2>TISZTELT MINTAVÁROSI POLGÁROK!</h2>
						<hr class="divider light my-4">
					</div>
				</div>
				<div class="row justify-content-around mb-5">
					<div class="col-lg-5 text-justify text-white-75">
						<p>Egy önkormányzat feladatai sokrétűek, állampolgári szemmel nehezen áttekinthetőek. Mintavárosban azonban nincs takargatni valónk, ezért úgy döntöttünk, hogy a modern technika segítségével bemutatjuk Önökek településünk gazdálkodását úgy, ahogyan azt korábban csak kevesek láthatták!</p>
						<p>A XXI. század embere joggal várhatja el egy önkormányzattól, hogy az interneten is utánanézhessen, mennyit költ a település oktatásra, egészségügyre vagy épp a parkok rendben tartására. A helyi demokráciára is igaz, kettőn áll a vásár. A tisztességes településvezetés mellé tájékozott polgárok is kellenek, akik nyomon követik a döntések ésszerűségét. A közpénzek átlátható felhasználásáért küzdő K-Monitor és a Költségvetési Felelősségi Intézet szakmai segítségével létrehozott alkalmazás, amit pillanatokon belül használatba vehet, Magyarországon elsőként arra törekszik, hogy mindenki számára könnyen befogadható és értelmezhető képet adjon az önkormányzat gazdálkodásáról.</p>
					</div>
					<div class="col-lg-5 text-justify text-white-75">
						<p>A weboldal testre szabható és egyszerűen feltölthető bármely település adataival. Reméljük, Mintaváros igyekezete ragadós lesz és egyre többen teszik meg ezt az egyáltalán nem megerőltető, mégis fontos lépést az átláthatóság felé.</p>
						<p class="my-5">Kellemes böngészést kívánok,</p>
						<div class="d-flex">
							<div class="my-auto w-33 d-flex align-center justify-content-center">
								<img
								 id="face"
								 src="http://mintavaros.deepdata.hu/assets/img/face.png"
								 alt=""
								 style="height: 100px;"
								>
							</div>
							<div class="flex-grow-1 ml-5">
								<img
								 class="signo"
								 src="http://mintavaros.deepdata.hu/assets/img/signo.png"
								>
								<p class="mb-0"><em>Példa Imre,<br>
										Mintaváros polgármestere</em></p>
							</div>
						</div>
					</div>
				</div>
				<div class="row justify-content-center mb-5">
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
export default {
	methods: {
		intro() {
			setTimeout(function() {
				introJs()
					.setOption("doneLabel", "Kilépés")
					.setOption("nextLabel", "Tovább")
					.setOption("prevLabel", "Vissza")
					.setOption("scrollToElement", false)
					.setOption("showBullets", false)
					.setOption("showProgress", false)
					.setOption("showStepNumbers", false)
					.setOption("skipLabel", "Kilépés")
					.setOption("tooltipPosition", "left")
					.setOptions({
						steps: [
							{
								element: "#inex-wrapper",
								intro:
									"Ebben a szakaszban a költségvetés bevételeinek és kiadásainak fő számait mutatjuk be.",
								position: "left"
							},
							{
								element: "#inex-wrapper .vis .left-column .bar:nth-child(1)",
								intro:
									"Ha az egér egy hasáb fölé kerül, további információ jelenik meg. Próbálja ki!",
								position: "top"
							},
							{
								element: "#income ul",
								intro:
									"A részletes bevételi és kiadási adatokat kétféle bontásban jelenítjük meg.",
								position: "top"
							},
							{
								element: "#income .vis > div",
								intro:
									"A hasábokra kattintva beléphet az adott kategóriába, a bal oldali függőleges sávval pedig vissza tud lépni.",
								position: "right"
							},
							{
								element: "#income ol.breadcrumb",
								intro:
									"A navigációs sáv megmutatja, hol van éppen a kategóriafában, valamint ennek segítségével vissza is tud lépni.",
								position: "bottom"
							},
							{
								element: "#face",
								intro: "Kellemes böngészést!",
								position: "left"
							}
						]
					})
					.onbeforechange(function(targetElement) {
						console.log(targetElement);
						$("html, body").animate(
							{
								scrollTop: $(targetElement).offset().top - 160
							},
							1000,
							"easeInOutExpo"
						);
					})
					.start();
			}, 1000);
		}
	}
};
</script>

<style lang="scss">
@import "../scss/introjs-modern";

.signo {
	height: 50px;
}

// Tooltip over Intro.js
.tooltip {
	z-index: 10000000 !important;
}
</style>
