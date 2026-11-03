/**
 * Pure Activity Selectors and Functional Aggregations
 * Transforms and filters raw activities without mutating the Redux store.
 */

import { filter, groupBy, pipe, reduce, sortBy } from './fp-core';

export interface ActivityItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly type: 'SINGLE' | 'RECURRING';
  readonly recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM_DAYS';
  readonly recurrenceInterval?: number;
  readonly status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly xpReward: number;
  readonly coinReward: number;
  readonly dueDate?: string | null;
  readonly projectId?: string | null;
  readonly creatorId: string;
  readonly assigneeId?: string | null;
  readonly creator?: {
    readonly id: string;
    readonly username: string;
    readonly avatarUrl?: string | null;
  };
  readonly assignee?: {
    readonly id: string;
    readonly username: string;
    readonly avatarUrl?: string | null;
  } | null;
  readonly project?: {
    readonly id: string;
    readonly name: string;
    readonly colorHex: string;
    readonly icon: string;
  } | null;
  readonly _count?: {
    readonly logs: number;
  };
}

export interface ActivityFilters {
  readonly projectId?: string | null;
  readonly type?: 'ALL' | 'SINGLE' | 'RECURRING';
  readonly status?: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  readonly priority?: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly assignedToMe?: boolean;
}

const priorityWeight: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Pure filter selector for activity lists
 */
export const selectFilteredActivities = (
  activities: readonly ActivityItem[],
  filters: ActivityFilters,
  currentUserId?: string,
): readonly ActivityItem[] => {
  return pipe(
    activities,
    filter((act) => {
      if (filters.projectId && act.projectId !== filters.projectId) {
        return false;
      }
      if (filters.type && filters.type !== 'ALL' && act.type !== filters.type) {
        return false;
      }
      if (
        filters.status &&
        filters.status !== 'ALL' &&
        act.status !== filters.status
      ) {
        return false;
      }
      if (
        filters.priority &&
        filters.priority !== 'ALL' &&
        act.priority !== filters.priority
      ) {
        return false;
      }
      if (filters.assignedToMe && currentUserId) {
        if (act.assigneeId !== currentUserId && act.creatorId !== currentUserId) {
          return false;
        }
      }
      return true;
    }),
  );
};

/**
 * Pure grouping by Type: Single vs Recurring
 */
export const groupActivitiesByType = (
  activities: readonly ActivityItem[],
): Readonly<{
  single: readonly ActivityItem[];
  recurring: readonly ActivityItem[];
}> => {
  const grouped = groupBy((a: ActivityItem) => a.type)(activities);
  return Object.freeze({
    single: grouped['SINGLE'] || Object.freeze([]),
    recurring: grouped['RECURRING'] || Object.freeze([]),
  });
};

/**
 * Pure grouping by Kanban status
 */
export const groupActivitiesByStatus = (
  activities: readonly ActivityItem[],
): Readonly<{
  pending: readonly ActivityItem[];
  inProgress: readonly ActivityItem[];
  completed: readonly ActivityItem[];
  overdue: readonly ActivityItem[];
}> => {
  const grouped = groupBy((a: ActivityItem) => a.status)(activities);
  return Object.freeze({
    pending: grouped['PENDING'] || Object.freeze([]),
    inProgress: grouped['IN_PROGRESS'] || Object.freeze([]),
    completed: grouped['COMPLETED'] || Object.freeze([]),
    overdue: grouped['OVERDUE'] || Object.freeze([]),
  });
};

/**
 * Pure sorting by Priority (CRITICAL first, then HIGH, MEDIUM, LOW)
 */
export const sortActivitiesByPriority = (
  activities: readonly ActivityItem[],
): readonly ActivityItem[] => {
  return sortBy((a: ActivityItem, b: ActivityItem) => {
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    return weightB - weightA;
  })(activities);
};

/**
 * Pure sorting by Due Date (earliest first)
 */
export const sortActivitiesByDueDate = (
  activities: readonly ActivityItem[],
): readonly ActivityItem[] => {
  return sortBy((a: ActivityItem, b: ActivityItem) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  })(activities);
};

/**
 * Pure summary calculation for quick HUD metrics
 */
export const computeActivitiesSummary = (activities: readonly ActivityItem[]) => {
  const total = activities.length;
  if (total === 0) {
    return Object.freeze({
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      progressPercent: 0,
      totalXpAvailable: 0,
    });
  }

  const counts = reduce(
    (
      acc: {
        completed: number;
        pending: number;
        inProgress: number;
        overdue: number;
        totalXp: number;
      },
      curr: ActivityItem,
    ) => {
      return {
        completed: acc.completed + (curr.status === 'COMPLETED' ? 1 : 0),
        pending: acc.pending + (curr.status === 'PENDING' ? 1 : 0),
        inProgress: acc.inProgress + (curr.status === 'IN_PROGRESS' ? 1 : 0),
        overdue: acc.overdue + (curr.status === 'OVERDUE' ? 1 : 0),
        totalXp: acc.totalXp + (curr.xpReward || 0),
      };
    },
    { completed: 0, pending: 0, inProgress: 0, overdue: 0, totalXp: 0 },
  )(activities);

  const progressPercent = Math.round((counts.completed / total) * 100);

  return Object.freeze({
    total,
    completed: counts.completed,
    pending: counts.pending,
    inProgress: counts.inProgress,
    overdue: counts.overdue,
    progressPercent,
    totalXpAvailable: counts.totalXp,
  });
};
