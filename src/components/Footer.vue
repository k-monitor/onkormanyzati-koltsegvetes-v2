<template>
	<footer class="py-5">
		<div class="container">
			<div class="row mb-4">
				<div
					class="col-12 col-lg-6 col-xl-7 d-flex"
					id="city-logo"
				>
					<div class="mr-5">
						<a href="https://www.terezvaros.hu/">
							<img
								src="assets/img/logo-big.png"
								alt=""
							>
						</a>
					</div>
					<div class="ml-4 mt-3">
						<p class="lead">
							<a
								href="https://www.terezvaros.hu/"
								target="_blank"
							>
								<i class="fas fa-fw fa-globe-europe mr-2"></i>
								<span class="d-none d-sm-inline">terezvaros.hu</span>
							</a>
						</p>
						<p class="lead"><a
								href="https://www.facebook.com/terezvaros.hu"
								target="_blank"
							>
								<i class="fab fa-fw fa-facebook mr-2"></i>
								<span class="d-none d-sm-inline">facebook.com/terezvaros.hu</span>
							</a>
						</p>
						<p class="lead">
							<a href="mailto:sajto@terezvaros.hu">
								<i class="fas fa-fw fa-envelope mr-2"></i>
								<span class="d-none d-sm-inline">sajto@terezvaros.hu</span>
							</a>
						</p>
					</div>
				</div>
				<div class="col mt-5 mt-lg-0">
					<div
						class="mb-3"
						id="logos"
					>
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
					<div id="license">
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
		</div>
	</footer>
</template>

<style lang="scss">
#logos a {
	opacity: 0.75;
	&:hover {
		opacity: 1;
	}
}

#city-logo img {
	max-height: 150px;
}

#logos img {
	display: inline-block;
	filter: invert(1);
	margin: 0 1rem 1rem 0;
	max-height: 32px;
}
</style>

