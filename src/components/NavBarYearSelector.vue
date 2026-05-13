<script setup lang="ts">
const { desktop } = defineProps<{
	desktop?: boolean;
}>();

const BREAKPOINT = 992; // Bootstrap LG
const { width } = useWindowSize();
const show = computed(() => {
	if (!years.length) return false;
	if (desktop) return width.value >= BREAKPOINT;
	return width.value < BREAKPOINT;
});

const { handleYearSelected, year } = useYear();

const years = Object.keys(DATA).sort().reverse();
</script>

<template>
	<li
		v-if="show"
		class="nav-item dropdown highlight"
	>
		<a
			id="navbarDropdown"
			class="nav-link dropdown-toggle mx-0 px-2 px-sm-3 px-lg-3"
			href="#"
			role="button"
			data-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false"
		>
			<span class="mr-1">{{ year }}</span>
		</a>
		<div
			class="dropdown-menu dropdown-menu-right"
			aria-labelledby="navbarDropdown"
		>
			<a
				v-for="y in years"
				:key="y"
				class="dropdown-item"
				href="javascript:void(0)"
				:class="['theme-' + slugify(y)]"
				@click="handleYearSelected(y)"
			>
				<i class="fas fa-circle mr-2" />
				{{ y }}
			</a>
		</div>
	</li>
</template>
