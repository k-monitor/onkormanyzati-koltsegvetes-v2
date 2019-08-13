<template>
	<section class="page-section bg-primary py-5">
		<div class="container">
			<div class="row">
				<div class="col">
					<h3 class="font-weight-light mb-5 text-center text-white">
						{{ $config.feedback.text }}
					</h3>
				</div>
			</div>
			<div class="row">
				<div class="col text-center">
					<a
					 class="btn btn-xl btn-light"
					 :href="$config.feedback.url"
					 target="_blank"
					>{{ $config.feedback.action }}</a>
				</div>
			</div>
		</div>
	</section>
</template>
