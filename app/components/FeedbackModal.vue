<script setup lang="ts">
import config from '~/data/config.json';
</script>

<template>
	<div
		aria-hidden="true"
		aria-labelledby="feedbackModalLabel"
		class="modal fade"
		id="feedbackModal"
		role="dialog"
		tabindex="-1"
	>
		<div
			class="modal-dialog modal-dialog-centered"
			role="document"
		>
			<div class="modal-content">
				<div class="modal-header">
					<h5
						class="modal-title"
						id="feedbackModalLabel"
					>
						{{ config.feedback.title }}
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
					<p class="font-weight-bold my-4 lead text-center">
						{{ config.feedback.text }}
					</p>
				</div>
				<div class="modal-footer">
					<a
						class="btn btn-primary"
						:href="config.feedback.url"
						target="_blank"
						>{{ config.feedback.action }}</a
					>
				</div>
			</div>
		</div>
	</div>
</template>
