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
					>
						{{ CONFIG.moreInfo.title }}
					</h5>
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
					<VueMarkdown
						:source="CONFIG.moreInfo.text"
						:anchorAttributes="{ target: '_blank' }"
					/>
				</div>
				<div class="modal-footer text-right">
					<a
						href="budget.xlsx"
						class="btn btn-primary"
					>
						<i class="fas fa-file-download fa-fw mr-1"></i>
						Adatok letöltése
					</a>
				</div>
			</div>
		</div>
	</div>
</template>
