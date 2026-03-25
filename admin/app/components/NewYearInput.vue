<script setup lang="ts">
import { Undo } from 'lucide-vue-next';

const { defaultYear } = defineProps<{
	defaultYear: string;
}>();

const newNameInput = defineModel<string>();

function resetNewName() {
	newNameInput.value = defaultYear;
}

onMounted(resetNewName);
</script>

<template>
	<div class="not-prose mb-4">
		<InputGroup>
			<InputGroupInput
				v-model="newNameInput"
				autocomplete="off"
				required
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					as-child
					variant="secondary"
				>
					<Button
						type="button"
						@click="resetNewName"
					>
						<Undo />
					</Button>
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	</div>
</template>
