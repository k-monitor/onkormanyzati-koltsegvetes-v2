<template>
	<section
		class="page-section"
		style="background-color: #dee2e6"
	>
		<div class="container">
			<div class="row">
				<div class="col-12 col-md-6">
					<figure class="figure">
						<img
							src="assets/img/cover.jpg"
							class="figure-img img-fluid rounded shadow"
						>
					</figure>
				</div>
				<div class="col offset-md-1 lead text-justify d-flex flex-column justify-content-between">
					<p>{{ $config.pub.lead }}</p>
					<div class="my-4 text-center">
						<a
							class="btn btn-outline-primary btn-xl"
							:href="$config.pub.url"
							target="_blank"
						>Elolvasom</a>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>