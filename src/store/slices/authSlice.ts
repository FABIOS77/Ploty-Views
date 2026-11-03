import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  nextLevelXp?: number;
  currentLevelBaseXp?: number;
  progressToNextLevelPercent?: number;
}

export interface GamificationCosmetic {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  metadata?: any;
}

export interface UserProfile extends UserStats {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  equippedMedal?: GamificationCosmetic | null;
  equippedTheme?: GamificationCosmetic | null;
  equippedFrame?: GamificationCosmetic | null;
  equippedTitle?: GamificationCosmetic | null;
  nextLevelXp: number;
  currentLevelBaseXp: number;
  progressToNextLevelPercent: number;
  progressPercent: number;
  xpForNextLevel?: number;
  xpCurrentLevel?: number;
  stats?: UserStats;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Pure normalization function that safely extracts gamification stats
 * regardless of whether they are placed at root or nested under `rawUser.stats`.
 * Persists normalized profile to localStorage.
 */
export const normalizeUserProfile = (rawUser: any): UserProfile | null => {
  if (!rawUser) return null;
  const stats = rawUser.stats || {};
  const xp = Number(rawUser.xp ?? stats.xp ?? 0);
  const level = Number(rawUser.level ?? stats.level ?? (xp > 0 ? Math.floor(1 + Math.sqrt(xp / 100)) : 1));
  const coins = Number(rawUser.coins ?? stats.coins ?? 0);
  const currentStreak = Number(rawUser.currentStreak ?? stats.currentStreak ?? 0);
  const longestStreak = Number(rawUser.longestStreak ?? stats.longestStreak ?? currentStreak);

  const nextLevelXp = Number(
    rawUser.nextLevelXp ??
      stats.nextLevelXp ??
      100 * Math.pow(Math.max(1, level), 2),
  );
  const currentLevelBaseXp = Number(
    rawUser.currentLevelBaseXp ??
      stats.currentLevelBaseXp ??
      (level > 1 ? 100 * Math.pow(level - 1, 2) : 0),
  );

  let progressPercent = rawUser.progressToNextLevelPercent ?? stats.progressToNextLevelPercent;
  if (typeof progressPercent !== 'number') {
    const range = nextLevelXp - currentLevelBaseXp;
    progressPercent =
      range > 0
        ? Math.round(
            Math.min(Math.max((xp - currentLevelBaseXp) / range, 0), 1) * 100,
          )
        : 0;
  }

  const normalized: UserProfile = {
    id: rawUser.id || '',
    username: rawUser.username || '',
    email: rawUser.email || '',
    avatarUrl: rawUser.avatarUrl ?? null,
    xp,
    level,
    coins,
    currentStreak,
    longestStreak,
    nextLevelXp,
    currentLevelBaseXp,
    progressToNextLevelPercent: progressPercent,
    progressPercent,
    xpForNextLevel: nextLevelXp,
    xpCurrentLevel: xp,
    equippedTheme: rawUser.equippedTheme ?? null,
    equippedMedal: rawUser.equippedMedal ?? null,
    equippedFrame: rawUser.equippedFrame ?? null,
    equippedTitle: rawUser.equippedTitle ?? null,
    stats: {
      xp,
      level,
      coins,
      currentStreak,
      longestStreak,
      nextLevelXp,
      currentLevelBaseXp,
      progressToNextLevelPercent: progressPercent,
    },
  };

  try {
    localStorage.setItem('ploty_user', JSON.stringify(normalized));
  } catch {
    // Ignore storage quota or access errors in restricted envs
  }

  return normalized;
};

const initialToken = localStorage.getItem('ploty_token');
let initialUser: UserProfile | null = null;
const cachedUserStr = localStorage.getItem('ploty_user');
if (cachedUserStr) {
  try {
    initialUser = normalizeUserProfile(JSON.parse(cachedUserStr));
  } catch {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: { username: string; email: string; password: string; avatarUrl?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/auth/register', payload);
      const { access_token, user } = response.data;
      if (access_token) {
        localStorage.setItem('ploty_token', access_token);
      }
      return { token: access_token, user: normalizeUserProfile(user) };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error registering account';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    payload: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/auth/login', payload);
      const { access_token, user } = response.data;
      if (access_token) {
        localStorage.setItem('ploty_token', access_token);
      }
      return { token: access_token, user: normalizeUserProfile(user) };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return normalizeUserProfile(response.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load profile';
      return rejectWithValue(Array.isArray(msg) ? msg[0] : msg);
    }
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('ploty_token');
      localStorage.removeItem('ploty_user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    syncUserStats: (
      state,
      action: PayloadAction<{
        xp?: number;
        level?: number;
        coins?: number;
        currentStreak?: number;
        longestStreak?: number;
        progressToNextLevelPercent?: number;
        equippedMedal?: GamificationCosmetic | null;
        equippedTheme?: GamificationCosmetic | null;
        equippedFrame?: GamificationCosmetic | null;
        equippedTitle?: GamificationCosmetic | null;
      }>,
    ) => {
      if (state.user) {
        state.user = normalizeUserProfile({
          ...state.user,
          ...action.payload,
        });
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // If unauthorized, clean up
      if (state.error?.toLowerCase().includes('unauthorized')) {
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('ploty_token');
        localStorage.removeItem('ploty_user');
      }
    });

    // Reactive HUD update when an activity completes (completeActivity.fulfilled)
    builder.addMatcher(
      (action) => action.type === 'activities/completeActivity/fulfilled',
      (state, action: any) => {
        const data = action.payload?.data;
        if (!data || !state.user) return;

        if (data.updatedUser) {
          state.user = normalizeUserProfile({ ...state.user, ...data.updatedUser });
          return;
        }

        const updatedStats = data.updatedStats || data.userStats;
        const rewards = data.rewards || data.reward || {};
        const xpEarned = Number(rewards.xpEarned ?? rewards.xpGained ?? 0);
        const coinsEarned = Number(rewards.coinsEarned ?? rewards.coinsGained ?? 0);

        const newXp = Number(updatedStats?.xp ?? (state.user.xp + xpEarned));
        const newCoins = Number(updatedStats?.coins ?? (state.user.coins + coinsEarned));
        const newLevel = Number(updatedStats?.level ?? data.newLevel ?? state.user.level);
        const newStreak = Number(updatedStats?.currentStreak ?? state.user.currentStreak);
        const newLongestStreak = Number(updatedStats?.longestStreak ?? state.user.longestStreak);

        state.user = normalizeUserProfile({
          ...state.user,
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          progressToNextLevelPercent: updatedStats?.progressToNextLevelPercent,
        });
      },
    );

    // Reactive HUD update when equipping cosmetic (equipItem.fulfilled)
    builder.addMatcher(
      (action) => action.type === 'gamification/equipItem/fulfilled',
      (state, action: any) => {
        const payload = action.payload?.payload;
        if (!state.user || !payload) return;

        if (payload.type === 'THEME') {
          const item = action.payload?.data?.equippedTheme || { id: payload.itemId };
          state.user = normalizeUserProfile({ ...state.user, equippedTheme: item });
        } else if (payload.type === 'MEDAL') {
          const item = action.payload?.data?.equippedMedal || { id: payload.itemId };
          state.user = normalizeUserProfile({ ...state.user, equippedMedal: item });
        }
      },
    );
  },
});

export const { logout, clearAuthError, syncUserStats } = authSlice.actions;
export default authSlice.reducer;
