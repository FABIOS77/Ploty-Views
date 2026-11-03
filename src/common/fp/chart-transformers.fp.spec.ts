import { describe, it, expect } from 'vitest';
import {
  transformDailyTrendForChart,
  transformPriorityBreakdownForChart,
  transformStatusDistributionForChart,
  normalizeRecurrenceVsSingle,
  calculateEfficiencyScore,
  filterAndSortActionProgress,
  computeProjectComparisonMatrix,
  type RawDailyTrendPoint,
  type ActionProgressItem,
  type ProjectProgressItem,
} from './chart-transformers.fp';

describe('Chart FP Transformers (chart-transformers.fp.ts)', () => {
  describe('transformDailyTrendForChart', () => {
    const rawTrend: readonly RawDailyTrendPoint[] = Object.freeze([
      { date: '2026-11-01', completedCount: 2, xpGained: 50 },
      { date: '2026-11-02', completedCount: 5, xpGained: 150 },
      { date: '2026-11-03', completedCount: 8, xpGained: 300 }, // Peak
      { date: '2026-11-04', completedCount: 3, xpGained: 100 },
    ]);

    it('generates shortDate labels and marks isPeakDay', () => {
      const enriched = transformDailyTrendForChart(rawTrend);
      expect(enriched.length).toBe(4);
      expect(enriched[2].isPeakDay).toBe(true);
      expect(enriched[0].isPeakDay).toBe(false);
      expect(enriched[0].shortDate).toBeDefined();
    });

    it('computes 3-point moving average of XP', () => {
      const enriched = transformDailyTrendForChart(rawTrend);
      expect(enriched[0].xpMovingAvg).toBe(50);
      expect(enriched[1].xpMovingAvg).toBe(100);
      expect(enriched[2].xpMovingAvg).toBe(167);
      expect(enriched[3].xpMovingAvg).toBe(183);
    });

    it('handles backend format with xpEarned and coinsEarned without failing', () => {
      const backendData = [
        { date: '2026-11-01', completedCount: 2, xpEarned: 80, coinsEarned: 30 },
        { date: '2026-11-02', completedCount: 4, xpEarned: 160, coinsEarned: 60 },
      ];
      const result = transformDailyTrendForChart(backendData);
      expect(result.length).toBe(2);
      expect(result[0].xpGained).toBe(80);
      expect(result[0].xpEarned).toBe(80);
      expect(result[0].coinsGained).toBe(30);
      expect(result[0].coinsEarned).toBe(30);
    });

    it('handles empty trend array immutably', () => {
      const empty = transformDailyTrendForChart([]);
      expect(empty).toEqual([]);
      expect(Object.isFrozen(empty)).toBe(true);

      const nullTrend = transformDailyTrendForChart(null);
      expect(nullTrend).toEqual([]);
    });
  });

  describe('transformPriorityBreakdownForChart', () => {
    it('correctly handles backend Array format', () => {
      const rawArray = [
        { priority: 'LOW', total: 5, completed: 3, completionRate: 60 },
        { priority: 'HIGH', total: 10, completed: 8, completionRate: 80 },
      ];
      const transformed = transformPriorityBreakdownForChart(rawArray);
      expect(transformed).toHaveLength(2);
      expect(transformed[0].priority).toBe('LOW');
      expect(transformed[0].Total).toBe(5);
      expect(transformed[0].Completadas).toBe(3);
    });

    it('correctly handles Object dictionary format', () => {
      const rawObject = {
        LOW: { total: 4, completed: 2, completionRate: 50 },
        CRITICAL: { total: 2, completed: 2, completionRate: 100 },
      };
      const transformed = transformPriorityBreakdownForChart(rawObject);
      expect(transformed).toHaveLength(2);
      expect(transformed.some((t) => t.priority === 'CRITICAL' && t.Total === 2)).toBe(true);
    });

    it('safely handles empty or null data', () => {
      expect(transformPriorityBreakdownForChart(null)).toEqual([]);
      expect(transformPriorityBreakdownForChart(undefined)).toEqual([]);
    });
  });

  describe('transformStatusDistributionForChart', () => {
    it('transforms array format into Recharts pie data with valid numbers', () => {
      const raw = [
        { status: 'COMPLETED', count: 12, percentage: 60 },
        { status: 'PENDING', count: 8, percentage: 40 },
      ];
      const pieData = transformStatusDistributionForChart(raw);
      expect(pieData).toHaveLength(2);
      expect(pieData[0].name).toBe('COMPLETED');
      expect(pieData[0].value).toBe(12);
      expect(pieData[0].color).toBe('#F66554');
    });

    it('safely handles null and empty distribution', () => {
      expect(transformStatusDistributionForChart(null)).toEqual([]);
    });
  });

  describe('normalizeRecurrenceVsSingle', () => {
    it('normalizes backend recurrence structure safely', () => {
      const backendShape = {
        single: { totalCreated: 4, totalExecutions: 3, xpEarned: 240 },
        recurring: { totalCreated: 2, totalExecutions: 14, xpEarned: 800 },
      };
      const normalized = normalizeRecurrenceVsSingle(backendShape);
      expect(normalized.single.completed).toBe(3);
      expect(normalized.single.total).toBe(4);
      expect(normalized.recurring.totalExecutions).toBe(14);
      expect(normalized.recurring.total).toBe(2);
    });

    it('handles null or missing properties with zero fallbacks', () => {
      const normalized = normalizeRecurrenceVsSingle(null);
      expect(normalized.single.total).toBe(0);
      expect(normalized.single.completed).toBe(0);
      expect(normalized.recurring.totalExecutions).toBe(0);
    });
  });

  describe('calculateEfficiencyScore', () => {
    it('calculates efficiency score using 0.6 * completionRate + 0.4 * min(streak * 10, 100)', () => {
      const score = calculateEfficiencyScore({
        totalActivities: 10,
        completedActivities: 8,
        completionRate: 80,
        currentStreak: 5,
      });
      expect(score).toBe(68);
    });

    it('caps streak multiplier at 100 max', () => {
      const score = calculateEfficiencyScore({
        totalActivities: 10,
        completedActivities: 10,
        completionRate: 100,
        currentStreak: 20,
      });
      expect(score).toBe(100);
    });

    it('returns 0 for null overview', () => {
      expect(calculateEfficiencyScore(null)).toBe(0);
    });
  });

  describe('filterAndSortActionProgress', () => {
    const actions: readonly ActionProgressItem[] = Object.freeze([
      {
        id: '1',
        title: 'Morning Yoga',
        type: 'RECURRING',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        progressPercent: 100,
        totalExecutions: 15,
        xpGenerated: 450,
        coinsGenerated: 200,
      },
      {
        id: '2',
        title: 'Deploy Production Cluster',
        type: 'SINGLE',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        progressPercent: 60,
        totalExecutions: 1,
        xpGenerated: 150,
        coinsGenerated: 75,
      },
      {
        id: '3',
        title: 'Code Review Pull Requests',
        type: 'RECURRING',
        priority: 'HIGH',
        status: 'PENDING',
        progressPercent: 30,
        totalExecutions: 8,
        xpGenerated: 240,
        coinsGenerated: 100,
      },
    ]);

    it('filters by type (RECURRING vs SINGLE)', () => {
      const recurring = filterAndSortActionProgress(actions, 'RECURRING');
      expect(recurring.length).toBe(2);
      expect(recurring.every((a) => a.type === 'RECURRING')).toBe(true);

      const single = filterAndSortActionProgress(actions, 'SINGLE');
      expect(single.length).toBe(1);
      expect(single[0].title).toBe('Deploy Production Cluster');
    });

    it('filters by search query case-insensitively', () => {
      const searchRes = filterAndSortActionProgress(actions, 'ALL', 'yoga');
      expect(searchRes.length).toBe(1);
      expect(searchRes[0].title).toBe('Morning Yoga');
    });

    it('sorts by field descending', () => {
      const byXP = filterAndSortActionProgress(actions, 'ALL', '', 'xpGenerated');
      expect(byXP[0].xpGenerated).toBe(450);
      expect(byXP[1].xpGenerated).toBe(240);
      expect(byXP[2].xpGenerated).toBe(150);

      const byExec = filterAndSortActionProgress(actions, 'ALL', '', 'totalExecutions');
      expect(byExec[0].totalExecutions).toBe(15);
      expect(byExec[1].totalExecutions).toBe(8);
      expect(byExec[2].totalExecutions).toBe(1);
    });
  });

  describe('computeProjectComparisonMatrix', () => {
    const projects: readonly ProjectProgressItem[] = Object.freeze([
      {
        id: 'p1',
        name: 'Backend API Core',
        colorHex: '#7477FF',
        icon: '⚡',
        totalActivities: 10,
        completedActivities: 9,
        progressPercent: 90, // LEADER
      },
      {
        id: 'p2',
        name: 'Mobile App Wireframes',
        colorHex: '#F66554',
        icon: '📱',
        totalActivities: 10,
        completedActivities: 3,
        progressPercent: 30, // BEHIND
      },
      {
        id: 'p3',
        name: 'Data Pipeline',
        colorHex: '#F9CD61',
        icon: '📊',
        totalActivities: 10,
        completedActivities: 6,
        progressPercent: 60, // ON_TRACK
      },
    ]);

    it('ranks projects by progressPercent descending and assigns correct tiers', () => {
      const matrix = computeProjectComparisonMatrix(projects);
      expect(matrix.projects.length).toBe(3);
      expect(matrix.projects[0].name).toBe('Backend API Core');
      expect(matrix.projects[0].rank).toBe(1);
      expect(matrix.projects[0].tier).toBe('LEADER');

      expect(matrix.projects[1].name).toBe('Data Pipeline');
      expect(matrix.projects[1].rank).toBe(2);
      expect(matrix.projects[1].tier).toBe('ON_TRACK');

      expect(matrix.projects[2].name).toBe('Mobile App Wireframes');
      expect(matrix.projects[2].rank).toBe(3);
      expect(matrix.projects[2].tier).toBe('BEHIND');
    });

    it('calculates average progress correctly', () => {
      const matrix = computeProjectComparisonMatrix(projects);
      expect(matrix.averageProgress).toBe(60);
      expect(matrix.topProjectName).toBe('Backend API Core');
    });

    it('handles empty projects array safely', () => {
      const matrix = computeProjectComparisonMatrix([]);
      expect(matrix.projects.length).toBe(0);
      expect(matrix.averageProgress).toBe(0);
      expect(matrix.topProjectName).toBe('Ninguno');
    });
  });
});
