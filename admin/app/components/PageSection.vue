<template>
	<div class="not-first-of-type:mt-12 not-first-of-type:border-t not-first-of-type:pt-4">
		<slot />
		<div
			v-if="$slots.actions"
			class="not-prose flex gap-8 [&>button]:cursor-pointer [&>label]:cursor-pointer"
		>
			<slot name="actions" />
		</div>
	</div>
</template>
