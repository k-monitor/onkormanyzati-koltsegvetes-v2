import type { BudgetNode } from '../../../src/utils/types';

export default () => useEventBus<{ parentNode: BudgetNode }>('node-creator');
