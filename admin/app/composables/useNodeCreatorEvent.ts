import type { Worksheet } from 'exceljs';
import type { BudgetNode } from '../../../src/utils/types';

export default () =>
	useEventBus<{ parentNode: BudgetNode; sheet: Worksheet | undefined }>('node-creator');
