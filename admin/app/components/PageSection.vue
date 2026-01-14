<template>
	<div class="not-first-of-type:mt-12 not-first-of-type:pt-4 not-first-of-type:border-t">
		<slot />
		<div
			v-if="$slots.actions"
			class="not-prose flex gap-8"
		>
			<slot name="actions" />
		</div>
	</div>
</template>
