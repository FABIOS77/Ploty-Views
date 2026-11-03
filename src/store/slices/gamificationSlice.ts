import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'THEME' | 'MEDAL' | 'TITLE' | 'AVATAR_FRAME' | 'BADGE';
  unlockLevel: number;
  costCoins: number;
  metadata?: any;
  isUnlocked: boolean;
  isEquipped: boolean;
  canAfford: boolean;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  avatarUrl?: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  equippedMedal?: any;
}

export interface FloatingRewardNotification {
  id: string;
  title: string;
  xp: number;
  coins: number;
  leveledUp?: boolean;
  newLevel?: number;
  medalName?: string;
  createdAt: number;
}

export interface GamificationState {
  catalog: CatalogItem[];
  leaderboard: LeaderboardUser[];
  equippedTheme: CatalogItem | null;
  equippedMedal: CatalogItem | null;
  rewardQueue: FloatingRewardNotification[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  catalog: [],
  leaderboard: [],
  equippedTheme: null,
  equippedMedal: null,
  rewardQueue: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchCatalog = createAsyncThunk(
  'gamification/fetchCatalog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/catalog');
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch catalog';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const buyItem = createAsyncThunk(
  'gamification/buyItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamification/shop/buy/${itemId}`);
      return { itemId, data: response.data };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Purchase failed';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const equipItem = createAsyncThunk(
  'gamification/equipItem',
  async (
    payload: { itemId: string; type: 'THEME' | 'MEDAL' },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch('/gamification/equip', {
        itemId: payload.itemId,
      });
      return { payload, data: response.data };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to equip item';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (projectId: string | undefined, { rejectWithValue }) => {
    try {
      const url = projectId
        ? `/gamification/leaderboard?projectId=${projectId}`
        : '/gamification/leaderboard';
      const response = await api.get(url);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch leaderboard';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    queueRewardNotification: (
      state,
      action: PayloadAction<Omit<FloatingRewardNotification, 'id' | 'createdAt'>>,
    ) => {
      const notification: FloatingRewardNotification = {
        ...action.payload,
        id: `reward-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      state.rewardQueue.push(notification);
    },
    dismissRewardNotification: (state, action: PayloadAction<string>) => {
      state.rewardQueue = state.rewardQueue.filter((n) => n.id !== action.payload);
    },
    clearAllRewardNotifications: (state) => {
      state.rewardQueue = [];
    },
  },
  extraReducers: (builder) => {
    // fetchCatalog
    builder.addCase(fetchCatalog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCatalog.fulfilled, (state, action) => {
      state.loading = false;
      state.catalog = action.payload;
    });
    builder.addCase(fetchCatalog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // buyItem
    builder.addCase(buyItem.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(buyItem.fulfilled, (state, action) => {
      state.actionLoading = false;
      const index = state.catalog.findIndex((item) => item.id === action.payload.itemId);
      if (index !== -1) {
        state.catalog[index].isUnlocked = true;
      }
    });
    builder.addCase(buyItem.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // equipItem
    builder.addCase(equipItem.fulfilled, (state, action) => {
      const { itemId, type } = action.payload.payload;
      const item = state.catalog.find((i) => i.id === itemId);
      if (item) {
        if (type === 'THEME') {
          state.equippedTheme = item;
        } else if (type === 'MEDAL') {
          state.equippedMedal = item;
        }
      }
      // Update catalog flags
      state.catalog = state.catalog.map((i) => {
        if (i.type === type) {
          return { ...i, isEquipped: i.id === itemId };
        }
        return i;
      });
    });

    // fetchLeaderboard
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboard = action.payload;
    });
  },
});

export const {
  queueRewardNotification,
  dismissRewardNotification,
  clearAllRewardNotifications,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
