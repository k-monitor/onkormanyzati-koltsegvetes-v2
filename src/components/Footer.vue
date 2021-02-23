<template>
	<footer class="bg-dark py-5 text-white-75">
		<div class="container">
			<div class="row">
				<div
					class="col-sm-6 col-lg-4"
					id="city-logo"
				>
					<a
						class="js-scroll-trigger"
						href="#page-top"
					>
						<img
							src="assets/img/logo-big.png"
							alt=""
						>
					</a>
				</div>
				<div
					class="col-sm-6 col-lg-4"
					id="logos"
				>
					<a
						href="http://www.kfib.hu/"
						target="_blank"
					><img
							src="assets/img/kfib-logo.png"
							alt=""
						></a>
					<a
						href="https://k-monitor.hu/"
						target="_blank"
					><img
							src="assets/img/k-monitor-logo.png"
							alt=""
						></a>
					<a
						href="https://www.deepdata.hu/"
						target="_blank"
					><img
							src="assets/img/deepdata-logo.png"
							alt=""
						></a>
				</div>
				<div
					class="col-lg-4 mt-5 mt-lg-0"
					id="license"
				>
					<i class="fab fa-fw fa-creative-commons"></i>
					<i class="fab fa-fw fa-creative-commons-by"></i>
					<i class="fab fa-fw fa-creative-commons-sa mr-2"></i>
					<br class="d-none d-lg-inline-block">
					Ez a Mű a <a
						rel="license"
						href="http://creativecommons.org/licenses/by-sa/4.0/"
					>Creative Commons
						Nevezd
						meg! - Így add tovább! 4.0 Nemzetközi Licenc</a> feltételeinek megfelelően felhasználható.
					<br>
					<i class="fab fa-github fa-fw mr-2"></i>
					<a
						href="https://github.com/k-monitor/onkormanyzati-koltsegvetes-v2"
						target="_blank"
					>Forráskód a GitHub-on</a>
					(licensz:
					<a
						href="https://spdx.org/licenses/GPL-3.0.html"
						target="_blank"
					>GPL 3.0</a>)
				</div>
			</div>
		</div>
	</footer>
</template>

<style>
#license a {
	color: white !important;
}

#city-logo img {
	max-height: 150px;
}

#logos img {
	display: inline-block;
	margin: 0 1rem 1rem 0;
	max-height: 32px;
}
</style>

