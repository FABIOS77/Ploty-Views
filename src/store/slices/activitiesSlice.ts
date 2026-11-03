import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { ActivityItem, ActivityFilters } from '../../common/fp/activity-selectors.fp';

export interface CompletionReward {
  xpGained: number;
  coinsGained: number;
  newLevel: number;
  newTotalXp: number;
  newCoins: number;
  currentStreak: number;
  leveledUp: boolean;
  unlockedMedals?: any[];
  activityTitle: string;
}

export interface ActivitiesState {
  activities: ActivityItem[];
  selectedActivity: ActivityItem | null;
  filters: ActivityFilters;
  loading: boolean;
  completingId: string | null;
  error: string | null;
  lastReward: CompletionReward | null;
}

const initialState: ActivitiesState = {
  activities: [],
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
  lastReward: null,
};

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (filters: Partial<ActivityFilters> | undefined, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (filters?.projectId) params.projectId = filters.projectId;
      if (filters?.type && filters.type !== 'ALL') params.type = filters.type;
      if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters?.priority && filters.priority !== 'ALL') params.priority = filters.priority;

      const response = await api.get('/activities', { params });
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch activities';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (
    payload: {
      title: string;
      description?: string;
      type: 'SINGLE' | 'RECURRING';
      recurrence?: string;
      recurrenceInterval?: number;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      xpReward?: number;
      coinReward?: number;
      dueDate?: string | null;
      projectId?: string | null;
      assigneeId?: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/activities', payload);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create activity';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async (
    payload: { id: string; data: Partial<ActivityItem> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/activities/${payload.id}`, payload.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update activity';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/activities/${id}`);
      return id;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete activity';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const completeActivity = createAsyncThunk(
  'activities/completeActivity',
  async (
    payload: { id: string; note?: string; title?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`/activities/${payload.id}/complete`, {
        note: payload.note,
      });
      // response.data shape: { activity, reward: { xpGained, coinsGained, newLevel, newTotalXp, newCoins, streakDays, leveledUp }, nextRecurrence }
      return {
        activityId: payload.id,
        title: payload.title || response.data.activity?.title || 'Activity',
        data: response.data,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete activity';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ActivityFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCompletedReward: (state) => {
      state.lastReward = null;
    },
    setSelectedActivity: (state, action: PayloadAction<ActivityItem | null>) => {
      state.selectedActivity = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchActivities
    builder.addCase(fetchActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.loading = false;
      state.activities = action.payload;
    });
    builder.addCase(fetchActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createActivity
    builder.addCase(createActivity.fulfilled, (state, action) => {
      state.activities.unshift(action.payload);
    });

    // updateActivity
    builder.addCase(updateActivity.fulfilled, (state, action) => {
      const index = state.activities.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.activities[index] = action.payload;
      }
    });

    // deleteActivity
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      state.activities = state.activities.filter((a) => a.id !== action.payload);
    });

    // completeActivity
    builder.addCase(completeActivity.pending, (state, action) => {
      state.completingId = action.meta.arg.id;
    });
    builder.addCase(completeActivity.fulfilled, (state, action) => {
      state.completingId = null;
      const { activityId, title, data } = action.payload;
      const updatedActivity = data.activity;

      // Update in activity list
      const index = state.activities.findIndex((a) => a.id === activityId);
      if (index !== -1) {
        if (updatedActivity) {
          state.activities[index] = updatedActivity;
        } else {
          state.activities[index].status = 'COMPLETED';
        }
      }

      // Store reward details
      const reward = data.rewards || data.reward || {};
      const xpGained = reward.xpGained ?? reward.xpEarned ?? 50;
      const coinsGained = reward.coinsGained ?? reward.coinsEarned ?? 25;
      const updatedStats = data.updatedStats || data.userStats || {};
      state.lastReward = {
        xpGained,
        coinsGained,
        newLevel: reward.newLevel ?? updatedStats.level,
        newTotalXp: reward.newTotalXp ?? updatedStats.xp,
        newCoins: reward.newCoins ?? updatedStats.coins,
        currentStreak: reward.streakDays ?? reward.currentStreak ?? updatedStats.currentStreak ?? 1,
        leveledUp: Boolean(reward.leveledUp ?? data.levelUp),
        unlockedMedals: reward.unlockedMedals || data.newlyUnlockedItems || [],
        activityTitle: title,
      };
    });
    builder.addCase(completeActivity.rejected, (state, action) => {
      state.completingId = null;
      state.error = action.payload as string;
    });
  },
});

export const { setFilters, clearCompletedReward, setSelectedActivity } =
  activitiesSlice.actions;
export default activitiesSlice.reducer;
