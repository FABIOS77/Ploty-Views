/**
 * Pure Functional Transformers for Interactive Visual Analytics & Charts
 * Strictly immutable business logic with mutable cloned projections for Recharts.
 */

import { filter, pipe, reduce, sortBy } from './fp-core';

export interface RawDailyTrendPoint {
  readonly date: string;
  readonly completedCount?: number;
  readonly xpGained?: number;
  readonly xpEarned?: number;
  readonly coinsGained?: number;
  readonly coinsEarned?: number;
}

export interface EnrichedDailyTrendPoint {
  readonly date: string;
  readonly completedCount: number;
  readonly xpGained: number;
  readonly xpEarned: number;
  readonly coinsGained: number;
  readonly coinsEarned: number;
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
    readonly totalCreated?: number;
    readonly totalExecutions?: number;
    readonly xpEarned?: number;
    readonly total?: number;
    readonly completed?: number;
    readonly completionRate?: number;
  };
  readonly recurring?: {
    readonly totalCreated?: number;
    readonly totalExecutions?: number;
    readonly xpEarned?: number;
    readonly total?: number;
    readonly activeHabits?: number;
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

export interface PriorityChartItem {
  priority: string;
  Total: number;
  Completadas: number;
  completionRate: number;
}

export interface StatusPieItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export const DEFAULT_STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#F66554', // Coral
  IN_PROGRESS: '#7477FF', // Periwinkle
  PENDING: '#F9CD61', // Gold
  OVERDUE: '#312F30', // Charcoal
};

/**
 * 1. transformDailyTrendForChart
 * Normalizes daily trend points accepting both xpGained/xpEarned and coinsGained/coinsEarned.
 * Computes moving averages, identifies peak days, and returns uncloned mutable objects for Recharts.
 */
export const transformDailyTrendForChart = (
  dailyTrend?: readonly RawDailyTrendPoint[] | null,
): EnrichedDailyTrendPoint[] => {
  if (!dailyTrend || dailyTrend.length === 0) {
    return Object.freeze([]) as unknown as EnrichedDailyTrendPoint[];
  }

  // Find max XP
  const maxXP = reduce(
    (max: number, point: RawDailyTrendPoint) => {
      const xp = Number(point.xpGained ?? point.xpEarned ?? 0);
      return xp > max ? xp : max;
    },
    0,
  )(dailyTrend);

  return dailyTrend.map((point, index, array) => {
    const xp = Number(point.xpGained ?? point.xpEarned ?? 0);
    const coins = Number(point.coinsGained ?? point.coinsEarned ?? 0);
    const completedCount = Number(point.completedCount ?? 0);

    const d = new Date(point.date);
    const shortDate = isNaN(d.getTime())
      ? point.date || ''
      : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    // 3-point moving average
    const windowStart = Math.max(0, index - 2);
    const windowSlice = array.slice(windowStart, index + 1);
    const windowSum = windowSlice.reduce(
      (sum, p) => sum + Number(p.xpGained ?? p.xpEarned ?? 0),
      0,
    );
    const xpMovingAvg = Math.round(windowSum / windowSlice.length);

    const isPeakDay = maxXP > 0 && xp === maxXP;

    return {
      date: point.date,
      shortDate,
      xpGained: xp,
      xpEarned: xp,
      coinsGained: coins,
      coinsEarned: coins,
      completedCount,
      xpMovingAvg,
      isPeakDay,
    };
  });
};

/**
 * 2. transformPriorityBreakdownForChart
 * Safely parses priority breakdown regardless of whether the backend delivers an Array or an Object.
 */
export const transformPriorityBreakdownForChart = (
  rawBreakdown: any,
): PriorityChartItem[] => {
  if (!rawBreakdown) return [];

  if (Array.isArray(rawBreakdown)) {
    return rawBreakdown.map((item) => ({
      priority: String(item.priority ?? 'N/A'),
      Total: Number(item.total ?? item.Total ?? 0),
      Completadas: Number(item.completed ?? item.Completadas ?? 0),
      completionRate: Number(item.completionRate ?? 0),
    }));
  }

  if (typeof rawBreakdown === 'object') {
    return Object.entries(rawBreakdown).map(([key, val]: [string, any]) => ({
      priority: key,
      Total: Number(val?.total ?? (typeof val === 'number' ? val : 0)),
      Completadas: Number(val?.completed ?? 0),
      completionRate: Number(val?.completionRate ?? 0),
    }));
  }

  return [];
};

/**
 * 3. transformStatusDistributionForChart
 * Safely converts status distribution into Recharts Pie items with guaranteed colors and numbers.
 */
export const transformStatusDistributionForChart = (
  rawDist: any,
  colors: Record<string, string> = DEFAULT_STATUS_COLORS,
): StatusPieItem[] => {
  if (!rawDist) return [];

  if (Array.isArray(rawDist)) {
    return rawDist
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const statusName = String(item.status ?? 'OTHER');
        const val = Number(item.count ?? item.value ?? 0);
        return {
          name: statusName,
          value: isNaN(val) ? 0 : val,
          percentage: Number(item.percentage ?? 0),
          color: colors[statusName] || '#7477FF',
        };
      });
  }

  if (typeof rawDist === 'object') {
    return Object.entries(rawDist).map(([status, countOrObj]: [string, any]) => {
      const val =
        typeof countOrObj === 'number'
          ? countOrObj
          : Number(countOrObj?.count ?? countOrObj?.value ?? 0);
      return {
        name: status,
        value: isNaN(val) ? 0 : val,
        percentage: 0,
        color: colors[status] || '#7477FF',
      };
    });
  }

  return [];
};

/**
 * 4. normalizeRecurrenceVsSingle
 * Unifies differences between backend analytics schema and frontend requirements.
 */
export const normalizeRecurrenceVsSingle = (raw: any) => {
  if (!raw) {
    return {
      single: {
        totalCreated: 0,
        totalExecutions: 0,
        xpEarned: 0,
        total: 0,
        completed: 0,
        completionRate: 0,
      },
      recurring: {
        totalCreated: 0,
        totalExecutions: 0,
        xpEarned: 0,
        total: 0,
        activeHabits: 0,
      },
    };
  }

  const s = raw.single || {};
  const r = raw.recurring || {};

  const singleTotal = Number(s.totalCreated ?? s.total ?? 0);
  const singleCompleted = Number(s.completed ?? s.totalExecutions ?? 0);
  const singleXp = Number(s.xpEarned ?? s.xpGained ?? 0);
  const singleRate = Number(
    s.completionRate ??
      (singleTotal > 0 ? Math.round((singleCompleted / singleTotal) * 100) : 0),
  );

  const recurringTotal = Number(r.totalCreated ?? r.total ?? 0);
  const recurringExecutions = Number(r.totalExecutions ?? 0);
  const recurringXp = Number(r.xpEarned ?? r.xpGained ?? 0);
  const activeHabits = Number(r.activeHabits ?? recurringTotal);

  return {
    single: {
      totalCreated: singleTotal,
      totalExecutions: singleCompleted,
      xpEarned: singleXp,
      total: singleTotal,
      completed: singleCompleted,
      completionRate: singleRate,
    },
    recurring: {
      totalCreated: recurringTotal,
      totalExecutions: recurringExecutions,
      xpEarned: recurringXp,
      total: recurringTotal,
      activeHabits,
    },
  };
};

/**
 * 5. calculateEfficiencyScore
 * Pure index: Efficiency = round(0.6 * CompletionRate + 0.4 * min(Streak * 10, 100))
 */
export const calculateEfficiencyScore = (
  overview?: OverviewStats | null,
  _recurrenceVsSingle?: any,
): number => {
  if (!overview) return 0;

  const completionRate = Number(overview.completionRate || 0);
  const streak = Number(overview.currentStreak || 0);

  const streakScore = Math.min(streak * 10, 100);
  const efficiency = Math.round(0.6 * completionRate + 0.4 * streakScore);

  return Math.max(0, Math.min(100, isNaN(efficiency) ? 0 : efficiency));
};

/**
 * 6. filterAndSortActionProgress
 * Purely filters by type, search query, and sorts by progress, executions or XP.
 */
export const filterAndSortActionProgress = (
  actions?: readonly ActionProgressItem[] | null,
  filterType: 'ALL' | 'SINGLE' | 'RECURRING' = 'ALL',
  searchQuery: string = '',
  sortByField: 'progressPercent' | 'totalExecutions' | 'xpGenerated' = 'progressPercent',
): ActionProgressItem[] => {
  if (!actions || actions.length === 0) return [];
  const query = searchQuery.trim().toLowerCase();

  const filtered = pipe(
    actions,
    filter((action) => {
      if (filterType !== 'ALL' && action.type !== filterType) {
        return false;
      }
      if (query.length > 0 && !action.title?.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    }),
    sortBy((a, b) => {
      const valA = Number(a[sortByField] ?? 0);
      const valB = Number(b[sortByField] ?? 0);
      return valB - valA; // Descending
    }),
  );

  return filtered.map((item) => ({ ...item }));
};

/**
 * 7. computeProjectComparisonMatrix
 * Ranks and normalizes progress of all projects.
 */
export const computeProjectComparisonMatrix = (
  projects?: readonly ProjectProgressItem[] | null,
): ProjectMatrixComparison => {
  if (!projects || projects.length === 0) {
    return {
      projects: [],
      averageProgress: 0,
      topProjectName: 'Ninguno',
    };
  }

  const sorted = sortBy((a: ProjectProgressItem, b: ProjectProgressItem) =>
    (b.progressPercent ?? 0) - (a.progressPercent ?? 0),
  )(projects);

  const totalProgress = reduce(
    (acc: number, p: ProjectProgressItem) => acc + (p.progressPercent ?? 0),
    0,
  )(projects);

  const averageProgress = Math.round(totalProgress / projects.length);
  const topProjectName = sorted[0]?.name || 'Ninguno';

  const rankedProjects = sorted.map((p, index) => {
    let tier: 'LEADER' | 'ON_TRACK' | 'BEHIND' = 'ON_TRACK';
    const percent = p.progressPercent ?? 0;
    if (percent >= 80) {
      tier = 'LEADER';
    } else if (percent < 40) {
      tier = 'BEHIND';
    }

    return {
      ...p,
      rank: index + 1,
      tier,
    };
  });

  return {
    projects: rankedProjects,
    averageProgress,
    topProjectName,
  };
};
