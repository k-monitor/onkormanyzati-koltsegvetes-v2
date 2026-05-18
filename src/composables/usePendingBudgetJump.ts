const pending = ref<object | null>(null);

export function usePendingBudgetJump() {
	return { pendingBudgetJump: pending };
}
