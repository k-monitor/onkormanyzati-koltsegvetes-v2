<template>
	<ProseBlock>
		<slot />
		<div
			v-if="$slots.actions"
			class="not-prose flex gap-8 [&>button]:cursor-pointer [&>label]:cursor-pointer"
		>
			<slot name="actions" />
		</div>
	</ProseBlock>
</template>
