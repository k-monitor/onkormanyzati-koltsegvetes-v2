<template>
	<footer class="py-5">
		<div class="container">
			<div class="row mb-4">
				<div
					class="col-12 col-lg-6 col-xl-7 px-0"
					id="city-logo"
				>
					<div class="mx-0 row w-100">
						<div class="col-12 col-sm-4 mb-5 mb-sm-0">
							<a
								class="js-scroll-trigger"
								:href="$config.footer.url"
								target="_blank"
							>
								<img
									src="/assets/img/logo-footer.png"
									alt=""
								>
							</a>
						</div>
						<div class="col-12 col-sm-8 mt-3" id="contacts">
							<p v-if="$config.footer.url" class="lead">
								<i class="fas fa-fw fa-globe-europe mr-2"></i>
								<a
									:href="$config.footer.url"
									target="_blank"
								>{{ $config.footer.url.replace(/^.*?\/\/|\/.*$|www\./g, '') }}</a>
							</p>
							<p v-if="$config.footer.fb" class="lead">
								<i class="fab fa-fw fa-facebook mr-2"></i>
								<a
									:href="`https://www.facebook.com/${$config.footer.fb}/`"
									target="_blank"
								>@{{ $config.footer.fb }}</a>
							</p>
							<p v-if="$config.footer.email" class="lead">
								<i class="fas fa-fw fa-envelope mr-2"></i>
								<a :href="`mailto:${$config.footer.email}`">{{ $config.footer.email }}</a>
							</p>
						</div>
					</div>
				</div>
				<div class="col mt-5 mt-lg-0">
					<div
						class="mb-3"
						id="logos"
					>
						<a
							class="mr-3"
							href="https://k-monitor.hu/"
							target="_blank"
						><img
								src="/assets/img/k-monitor-logo.png"
								alt=""
							></a>
						<a
							class="mr-3"
							href="https://www.deepdata.hu/"
							target="_blank"
						><img
								src="/assets/img/deepdata-logo.png"
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
#contacts a,
#license a {
	//color: white !important;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
}

#logos a {
	opacity: 0.75;
	&:hover {
		opacity: 1;
	}
}

#city-logo img {
	max-height: 150px;
	max-width: 150px;
}

#logos img {
	display: inline-block;
	filter: invert(1);
	margin: 0 1rem 1rem 0;
	max-height: 32px;
}
</style>

