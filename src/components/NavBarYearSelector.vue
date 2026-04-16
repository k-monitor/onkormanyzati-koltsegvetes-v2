<script setup lang="ts">
const { subpageMode } = defineProps<{
	subpageMode?: boolean;
}>();

const { handleYearSelected, year } = useYear();

const years = subpageMode ? [] : Object.keys(DATA).sort().reverse();
</script>

<template>
	<li
		v-if="years.length > 1"
		class="nav-item dropdown highlight"
	>
		<a
			id="navbarDropdown"
			class="nav-link dropdown-toggle"
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
