<template>
	<div
		aria-hidden="true"
		aria-labelledby="moreInfoModalLabel"
		class="modal fade"
		id="moreInfoModal"
		role="dialog"
		tabindex="-1"
	>
		<div
			class="modal-dialog modal-dialog-centered modal-lg"
			role="document"
		>
			<div class="modal-content">
				<div class="modal-header">
					<h5
						class="modal-title"
						id="moreInfoModalLabel"
					>{{ $config.moreInfo.title }}</h5>
					<button
						aria-label="Close"
						class="close"
						data-dismiss="modal"
						type="button"
					>
						<span aria-hidden="true">
							<i class="far fa-times-circle"></i>
						</span>
					</button>
				</div>
				<div class="modal-body">
					<p
						class="text-justify"
						v-for="(p, i) in $config.moreInfo.paragraphs"
						:key="i"
					>{{ p }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
