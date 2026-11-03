/**
 * Pure Functional Transformers for Interactive Visual Analytics & Charts
 * Strictly immutable, pure functions, zero side-effects.
 */

import { filter, pipe, reduce, sortBy } from './fp-core';

export interface RawDailyTrendPoint {
  readonly date: string;
  readonly completedCount: number;
  readonly xpGained: number;
  readonly coinsGained?: number;
}

export interface EnrichedDailyTrendPoint extends RawDailyTrendPoint {
  readonly shortDate: string;
  readonly xpMovingAvg: number;
  readonly isPeakDay: boolean;
}

export interface OverviewStats {
  readonly totalActivities: number;
  readonly completedActivities: number;
  readonly completionRate: number;
  readonly currentStreak?: number;
  readonly longestStreak?: number;
}

export interface RecurrenceVsSingleStats {
  readonly single?: {
    readonly total: number;
    readonly completed: number;
    readonly completionRate: number;
  };
  readonly recurring?: {
    readonly total: number;
    readonly totalExecutions: number;
    readonly activeHabits: number;
  };
}

export interface ActionProgressItem {
  readonly id: string;
  readonly title: string;
  readonly type: 'SINGLE' | 'RECURRING';
  readonly recurrence?: string | null;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  readonly progressPercent: number;
  readonly totalExecutions: number;
  readonly xpGenerated: number;
  readonly coinsGenerated: number;
  readonly lastExecutedAt?: string | null;
}

export interface ProjectProgressItem {
  readonly id: string;
  readonly name: string;
  readonly colorHex: string;
  readonly icon: string;
  readonly isTeamProject?: boolean;
  readonly totalActivities: number;
  readonly completedActivities: number;
  readonly progressPercent: number;
}

export interface ProjectMatrixComparison {
  readonly projects: readonly (ProjectProgressItem & {
    readonly rank: number;
    readonly tier: 'LEADER' | 'ON_TRACK' | 'BEHIND';
  })[];
  readonly averageProgress: number;
  readonly topProjectName: string;
}

/**
 * 1. transformDailyTrendForChart
 * Purely computes short date labels, 3-day moving average of XP, and marks peak days.
 */
export const transformDailyTrendForChart = (
  dailyTrend: readonly RawDailyTrendPoint[],
): readonly EnrichedDailyTrendPoint[] => {
  if (!dailyTrend || dailyTrend.length === 0) {
    return Object.freeze([]);
  }

  // Find peak day XP
  const maxXP = reduce(
    (max: number, point: RawDailyTrendPoint) =>
      point.xpGained > max ? point.xpGained : max,
    0,
  )(dailyTrend);

  return Object.freeze(
    dailyTrend.map((point, index, array) => {
      // Short date: "DD MMM"
      const d = new Date(point.date);
      const shortDate = isNaN(d.getTime())
        ? point.date
        : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

      // 3-point moving average
      const windowStart = Math.max(0, index - 2);
      const windowSlice = array.slice(windowStart, index + 1);
      const windowSum = windowSlice.reduce((sum, p) => sum + p.xpGained, 0);
      const xpMovingAvg = Math.round(windowSum / windowSlice.length);

      const isPeakDay = maxXP > 0 && point.xpGained === maxXP;

      return Object.freeze({
        ...point,
        shortDate,
        xpMovingAvg,
        isPeakDay,
      });
    }),
  );
};

/**
 * 2. calculateEfficiencyScore
 * Pure index: Efficiency = round(0.6 * CompletionRate + 0.4 * min(Streak * 10, 100))
 */
export const calculateEfficiencyScore = (
  overview?: OverviewStats | null,
  _recurrenceVsSingle?: RecurrenceVsSingleStats | null,
): number => {
  if (!overview) return 0;

  const completionRate = overview.completionRate || 0;
  const streak = overview.currentStreak || 0;

  const streakScore = Math.min(streak * 10, 100);
  const efficiency = Math.round(0.6 * completionRate + 0.4 * streakScore);

  return Math.max(0, Math.min(100, efficiency));
};

/**
 * 3. filterAndSortActionProgress
 * Purely filters by type, search query, and sorts by progress, executions or XP.
 */
export const filterAndSortActionProgress = (
  actions: readonly ActionProgressItem[],
  filterType: 'ALL' | 'SINGLE' | 'RECURRING' = 'ALL',
  searchQuery: string = '',
  sortByField: 'progressPercent' | 'totalExecutions' | 'xpGenerated' = 'progressPercent',
): readonly ActionProgressItem[] => {
  const query = searchQuery.trim().toLowerCase();

  return pipe(
    actions,
    filter((action) => {
      if (filterType !== 'ALL' && action.type !== filterType) {
        return false;
      }
      if (query.length > 0 && !action.title.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    }),
    sortBy((a, b) => {
      const valA = a[sortByField] ?? 0;
      const valB = b[sortByField] ?? 0;
      return valB - valA; // Descending
    }),
  );
};

/**
 * 4. computeProjectComparisonMatrix
 * Ranks and normalizes progress of all projects.
 */
export const computeProjectComparisonMatrix = (
  projects: readonly ProjectProgressItem[],
): Readonly<ProjectMatrixComparison> => {
  if (!projects || projects.length === 0) {
    return Object.freeze({
      projects: Object.freeze([]),
      averageProgress: 0,
      topProjectName: 'Ninguno',
    });
  }

  const sorted = sortBy((a: ProjectProgressItem, b: ProjectProgressItem) =>
    b.progressPercent - a.progressPercent,
  )(projects);

  const totalProgress = reduce(
    (acc: number, p: ProjectProgressItem) => acc + p.progressPercent,
    0,
  )(projects);

  const averageProgress = Math.round(totalProgress / projects.length);
  const topProjectName = sorted[0]?.name || 'Ninguno';

  const rankedProjects = sorted.map((p, index) => {
    let tier: 'LEADER' | 'ON_TRACK' | 'BEHIND' = 'ON_TRACK';
    if (p.progressPercent >= 80) {
      tier = 'LEADER';
    } else if (p.progressPercent < 40) {
      tier = 'BEHIND';
    }

    return Object.freeze({
      ...p,
      rank: index + 1,
      tier,
    });
  });

  return Object.freeze({
    projects: Object.freeze(rankedProjects),
    averageProgress,
    topProjectName,
  });
};
