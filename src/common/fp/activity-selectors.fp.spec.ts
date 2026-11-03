import { describe, it, expect } from 'vitest';
import type { ActivityItem } from './activity-selectors.fp';
import {
  selectFilteredActivities,
  groupActivitiesByType,
  groupActivitiesByStatus,
  sortActivitiesByPriority,
  sortActivitiesByDueDate,
  computeActivitiesSummary,
} from './activity-selectors.fp';

describe('Frontend Activity FP Selectors (activity-selectors.fp.ts)', () => {
  const sampleActivities: readonly ActivityItem[] = Object.freeze([
    {
      id: 'act-1',
      title: 'Setup Database',
      type: 'SINGLE',
      status: 'COMPLETED',
      priority: 'HIGH',
      xpReward: 100,
      coinReward: 50,
      dueDate: '2026-11-01T10:00:00Z',
      projectId: 'proj-1',
      creatorId: 'user-1',
      assigneeId: 'user-1',
    },
    {
      id: 'act-2',
      title: 'Daily Standup',
      type: 'RECURRING',
      recurrence: 'DAILY',
      status: 'PENDING',
      priority: 'LOW',
      xpReward: 20,
      coinReward: 10,
      dueDate: '2026-11-04T09:00:00Z',
      projectId: 'proj-1',
      creatorId: 'user-1',
      assigneeId: 'user-2',
    },
    {
      id: 'act-3',
      title: 'Fix Auth Bug',
      type: 'SINGLE',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      xpReward: 150,
      coinReward: 75,
      dueDate: '2026-11-02T12:00:00Z',
      projectId: 'proj-2',
      creatorId: 'user-2',
      assigneeId: 'user-1',
    },
    {
      id: 'act-4',
      title: 'Expired Task',
      type: 'SINGLE',
      status: 'OVERDUE',
      priority: 'MEDIUM',
      xpReward: 50,
      coinReward: 25,
      dueDate: '2026-10-25T12:00:00Z',
      projectId: 'proj-2',
      creatorId: 'user-3',
      assigneeId: 'user-3',
    },
  ]);

  describe('selectFilteredActivities', () => {
    it('returns all activities if no filters are applied', () => {
      const filtered = selectFilteredActivities(sampleActivities, {});
      expect(filtered.length).toBe(4);
    });

    it('filters by projectId', () => {
      const filtered = selectFilteredActivities(sampleActivities, { projectId: 'proj-1' });
      expect(filtered.length).toBe(2);
      expect(filtered.every((a) => a.projectId === 'proj-1')).toBe(true);
    });

    it('filters by type (SINGLE / RECURRING)', () => {
      const single = selectFilteredActivities(sampleActivities, { type: 'SINGLE' });
      expect(single.length).toBe(3);
      const recurring = selectFilteredActivities(sampleActivities, { type: 'RECURRING' });
      expect(recurring.length).toBe(1);
    });

    it('filters by status', () => {
      const pending = selectFilteredActivities(sampleActivities, { status: 'PENDING' });
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe('act-2');
    });

    it('filters by assignedToMe for a specific user', () => {
      const user1Tasks = selectFilteredActivities(
        sampleActivities,
        { assignedToMe: true },
        'user-1',
      );
      // act-1 (assignee & creator), act-2 (creator), act-3 (assignee)
      expect(user1Tasks.length).toBe(3);
    });
  });

  describe('groupActivitiesByType', () => {
    it('groups into single and recurring buckets', () => {
      const grouped = groupActivitiesByType(sampleActivities);
      expect(grouped.single.length).toBe(3);
      expect(grouped.recurring.length).toBe(1);
      expect(grouped.recurring[0].title).toBe('Daily Standup');
    });
  });

  describe('groupActivitiesByStatus', () => {
    it('groups into Kanban status buckets', () => {
      const grouped = groupActivitiesByStatus(sampleActivities);
      expect(grouped.completed.length).toBe(1);
      expect(grouped.pending.length).toBe(1);
      expect(grouped.inProgress.length).toBe(1);
      expect(grouped.overdue.length).toBe(1);
    });
  });

  describe('sortActivitiesByPriority', () => {
    it('sorts by CRITICAL > HIGH > MEDIUM > LOW', () => {
      const sorted = sortActivitiesByPriority(sampleActivities);
      expect(sorted[0].priority).toBe('CRITICAL');
      expect(sorted[1].priority).toBe('HIGH');
      expect(sorted[2].priority).toBe('MEDIUM');
      expect(sorted[3].priority).toBe('LOW');
    });
  });

  describe('sortActivitiesByDueDate', () => {
    it('sorts by dueDate ascending', () => {
      const sorted = sortActivitiesByDueDate(sampleActivities);
      expect(sorted[0].id).toBe('act-4'); // 2026-10-25
      expect(sorted[1].id).toBe('act-1'); // 2026-11-01
      expect(sorted[2].id).toBe('act-3'); // 2026-11-02
      expect(sorted[3].id).toBe('act-2'); // 2026-11-04
    });
  });

  describe('computeActivitiesSummary', () => {
    it('computes total, completed, pending, inProgress, overdue, progress percent and XP', () => {
      const summary = computeActivitiesSummary(sampleActivities);
      expect(summary.total).toBe(4);
      expect(summary.completed).toBe(1);
      expect(summary.pending).toBe(1);
      expect(summary.inProgress).toBe(1);
      expect(summary.overdue).toBe(1);
      expect(summary.progressPercent).toBe(25); // 1 / 4 = 25%
      expect(summary.totalXpAvailable).toBe(320); // 100 + 20 + 150 + 50
    });

    it('returns zeroed metrics for empty activity list', () => {
      const summary = computeActivitiesSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.progressPercent).toBe(0);
      expect(summary.totalXpAvailable).toBe(0);
    });
  });
});
