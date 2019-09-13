<template>
	<section class="page-section milestones">
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="col text-center">
					<h2>{{ $config.milestones.title }}</h2>
					<hr class="divider my-4 mb-5">
				</div>
			</div>
			<div class="row">
				<div
					class="col-md-6 col-lg-4 embed-responsive embed-responsive-16by9"
					v-for="(m, i) in $milestones.milestones"
					:key="i"
				>
					<Milestone class="embed-responsive-item" :milestone="m" />
				</div>
			</div>
		</div>
	</section>
</template>