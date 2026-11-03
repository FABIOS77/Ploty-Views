import { describe, it, expect } from 'vitest';
import activitiesReducer, {
  setFilters,
  clearCompletedReward,
  setSelectedActivity,
  type ActivitiesState,
} from './activitiesSlice';
import type { ActivityItem } from '../../common/fp/activity-selectors.fp';

describe('Activities Redux Slice (activitiesSlice.ts)', () => {
  const dummyActivity: ActivityItem = {
    id: 'act-99',
    title: 'Daily Meditation',
    type: 'RECURRING',
    recurrence: 'DAILY',
    status: 'PENDING',
    priority: 'HIGH',
    xpReward: 30,
    coinReward: 15,
    creatorId: 'u-1',
  };

  const initialTestState: ActivitiesState = {
    activities: [dummyActivity],
    selectedActivity: null,
    filters: {
      type: 'ALL',
      status: 'ALL',
      priority: 'ALL',
      assignedToMe: false,
    },
    loading: false,
    completingId: null,
    error: null,
    lastReward: {
      xpGained: 50,
      coinsGained: 25,
      newLevel: 2,
      newTotalXp: 200,
      newCoins: 100,
      currentStreak: 2,
      leveledUp: false,
      activityTitle: 'Past Task',
    },
  };

  it('handles setFilters to update filter criteria', () => {
    const state = activitiesReducer(
      initialTestState,
      setFilters({ type: 'RECURRING', priority: 'HIGH' }),
    );
    expect(state.filters.type).toBe('RECURRING');
    expect(state.filters.priority).toBe('HIGH');
    expect(state.filters.status).toBe('ALL'); // unchanged
  });

  it('handles clearCompletedReward to reset the dopamine reward modal state', () => {
    const state = activitiesReducer(initialTestState, clearCompletedReward());
    expect(state.lastReward).toBeNull();
  });

  it('handles setSelectedActivity to focus on a single task', () => {
    const state = activitiesReducer(initialTestState, setSelectedActivity(dummyActivity));
    expect(state.selectedActivity?.id).toBe('act-99');
    expect(state.selectedActivity?.title).toBe('Daily Meditation');
  });
});
