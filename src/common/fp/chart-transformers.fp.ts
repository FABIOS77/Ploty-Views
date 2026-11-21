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

// ==========================================
// ADVANCED ANALYTICS: HEATMAP, RADAR & CSV
// ==========================================

export interface HeatmapCell {
  date: string;
  shortDate: string;
  completedCount: number;
  xpEarned: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

const computeHeatmapIntensity = (
  completedCount: number,
  xpEarned: number,
): 0 | 1 | 2 | 3 | 4 => {
  if (completedCount <= 0 && xpEarned <= 0) return 0;
  if (completedCount >= 4 || xpEarned >= 200) return 4;
  if (completedCount === 3 || xpEarned >= 120) return 3;
  if (completedCount === 2 || xpEarned >= 60) return 2;
  return 1;
};

/**
 * 8. buildConsistencyHeatmap
 * Purely constructs a continuous N-day grid (default 30) with intensity levels 0..4.
 */
export const buildConsistencyHeatmap = (
  dailySeries?: readonly RawDailyTrendPoint[] | null,
  days: number = 30,
  referenceDate: Date = new Date(),
): HeatmapCell[] => {
  const safeDays = Math.max(1, Math.min(365, Math.floor(days)));

  const byDate = (dailySeries ?? []).reduce(
    (acc, point) => {
      const key = String(point.date).slice(0, 10);
      return { ...acc, [key]: point };
    },
    {} as Record<string, RawDailyTrendPoint>,
  );

  return Array.from({ length: safeDays }, (_, idx) => {
    const offset = safeDays - 1 - idx;
    const d = new Date(referenceDate.getTime());
    d.setUTCDate(d.getUTCDate() - offset);
    const isoDate = d.toISOString().slice(0, 10);
    const shortDate = d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    });

    const match = byDate[isoDate];
    const completedCount = Number(match?.completedCount ?? 0);
    const xpEarned = Number(match?.xpGained ?? match?.xpEarned ?? 0);

    return {
      date: isoDate,
      shortDate,
      completedCount,
      xpEarned,
      intensity: computeHeatmapIntensity(completedCount, xpEarned),
    };
  });
};

export interface PlayerRadarMetric {
  dimension: string;
  score: number;
  fullMark: number;
}

export interface PlayerRadarInput {
  readonly overview?: OverviewStats | null;
  readonly priorityBreakdown?: any;
  readonly recurrenceVsSingle?: any;
  readonly projectsProgress?: readonly ProjectProgressItem[] | null;
}

const clampScore = (val: number): number =>
  Math.max(0, Math.min(100, Math.round(isNaN(val) ? 0 : val)));

/**
 * 9. buildPlayerRadarMetrics
 * Purely computes 5 player dimensions [0..100]: Constancia, Tareas Críticas, Hábitos, Colaboración, Eficiencia.
 */
export const buildPlayerRadarMetrics = (
  input: PlayerRadarInput,
): PlayerRadarMetric[] => {
  const overview = input.overview;
  const streak = Number(overview?.currentStreak ?? 0);
  const longestStreak = Number(overview?.longestStreak ?? streak);
  const constancia = clampScore(streak * 15 + longestStreak * 4);

  const priorities = transformPriorityBreakdownForChart(input.priorityBreakdown);
  const criticalAndHigh = priorities.filter(
    (p) => p.priority === 'CRITICAL' || p.priority === 'HIGH',
  );
  const critTotal = criticalAndHigh.reduce((acc, p) => acc + p.Total, 0);
  const critCompleted = criticalAndHigh.reduce((acc, p) => acc + p.Completadas, 0);
  const tareasCriticas =
    critTotal > 0
      ? clampScore((critCompleted / critTotal) * 100)
      : clampScore(overview?.completionRate ?? 0);

  const recStats = normalizeRecurrenceVsSingle(input.recurrenceVsSingle);
  const habitos = clampScore(
    recStats.recurring.totalExecutions * 12 + recStats.recurring.activeHabits * 10,
  );

  const projects = input.projectsProgress ?? [];
  const teamProjects = projects.filter((p) => p.isTeamProject);
  const teamAvgProgress =
    teamProjects.length > 0
      ? teamProjects.reduce((sum, p) => sum + (p.progressPercent ?? 0), 0) /
        teamProjects.length
      : projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.progressPercent ?? 0), 0) /
          projects.length
        : 0;
  const colaboracion = clampScore(
    teamProjects.length > 0
      ? Math.min(40, teamProjects.length * 25) + teamAvgProgress * 0.6
      : teamAvgProgress * 0.5,
  );

  const eficiencia = calculateEfficiencyScore(overview, input.recurrenceVsSingle);

  return [
    { dimension: 'Constancia', score: constancia, fullMark: 100 },
    { dimension: 'Tareas Críticas', score: tareasCriticas, fullMark: 100 },
    { dimension: 'Hábitos', score: habitos, fullMark: 100 },
    { dimension: 'Colaboración', score: colaboracion, fullMark: 100 },
    { dimension: 'Eficiencia', score: eficiencia, fullMark: 100 },
  ];
};

const escapeCsvField = (value: string | number | null | undefined): string => {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export interface CsvExportInput {
  readonly scope: 'GLOBAL' | 'PROJECT';
  readonly projectName?: string;
  readonly actions: readonly ActionProgressItem[];
  readonly projects?: readonly ProjectProgressItem[];
}

/**
 * 10. serializeReportToCsv
 * Pure RFC-4180 CSV serializer with UTF-8 BOM for clean spreadsheet export.
 */
export const serializeReportToCsv = (input: CsvExportInput): string => {
  const header = [
    'Sección',
    'Nombre / Título',
    'Tipo / Ámbito',
    'Prioridad',
    'Estado',
    'Progreso (%)',
    'Ejecuciones / Completadas',
    'XP Generada',
  ];

  const actionRows = (input.actions ?? []).map((a) =>
    [
      input.scope === 'PROJECT' ? `Proyecto: ${input.projectName || 'Actual'}` : 'Acción',
      a.title,
      a.type === 'RECURRING' ? 'Hábito Recurrente' : 'Tarea Única',
      a.priority,
      a.status,
      a.progressPercent,
      a.totalExecutions,
      a.xpGenerated,
    ]
      .map(escapeCsvField)
      .join(','),
  );

  const projectRows =
    input.scope === 'GLOBAL'
      ? (input.projects ?? []).map((p) =>
          [
            'Proyecto',
            p.name,
            p.isTeamProject ? 'Equipo' : 'Individual',
            '-',
            `${p.completedActivities}/${p.totalActivities}`,
            p.progressPercent,
            p.completedActivities,
            0,
          ]
            .map(escapeCsvField)
            .join(','),
        )
      : [];

  return `\uFEFF${[header.map(escapeCsvField).join(','), ...projectRows, ...actionRows].join('\n')}`;
};
