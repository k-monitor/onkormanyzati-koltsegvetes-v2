import configJson from '~/data/config.json';
import dataJson from '~/data/data.json';
import milestonesJson from '~/data/milestones.json';
import tagsJson from '../data/tags.json';
import tooltipsJson from '~/data/tooltips.json';

export const CONFIG = configJson;
export const DATA = dataJson as BudgetData;
export const MILESTONES = (milestonesJson as Milestones).milestones;
export const MILESTONE_RELS = (milestonesJson as Milestones).rels;
export const TAGS = tagsJson;
export const TOOLTIPS = tooltipsJson as Record<string, Record<string, string>>;

if (Object.values(DATA).some((b) => !b.income)) CONFIG.modules.income = 0;

if (!CONFIG.modules.income) CONFIG.modules.inex = 0;
