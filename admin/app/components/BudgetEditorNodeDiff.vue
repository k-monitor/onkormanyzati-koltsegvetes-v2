<script setup lang="ts">
import { Diff, Sigma } from 'lucide-vue-next';

defineProps<{
	nodeValue: number;
	sum: number;
}>();
</script>

<template>
	<div
		class="text-destructive grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5 pr-10 pl-3"
	>
		<Diff class="size-4" />
		<span class="text-right">{{ Number(Math.abs(sum - nodeValue)).toLocaleString('hu') }}</span>

		<Sigma class="size-4" />
		<span class="text-right">{{ Number(sum).toLocaleString('hu') }}</span>
	</div>
</template>
