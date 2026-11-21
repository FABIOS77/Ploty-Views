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
  equippedThemeId?: string | null;
  equippedMedalId?: string | null;
  equippedFrameId?: string | null;
  equippedTitleId?: string | null;
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
 * 100% Pure normalization function (ZERO side effects — no localStorage calls).
 * Safely extracts gamification stats and cosmetic IDs whether placed at root or under `rawUser.stats`.
 */
export const normalizeUserProfile = (rawUser: any): UserProfile | null => {
  if (!rawUser) return null;
  const stats = rawUser.stats || {};
  const xp = Number(rawUser.xp ?? stats.xp ?? 0);
  const level = Number(
    rawUser.level ??
      stats.level ??
      (xp > 0 ? Math.floor(1 + Math.sqrt(xp / 100)) : 1),
  );
  const coins = Number(rawUser.coins ?? stats.coins ?? 0);
  const currentStreak = Number(rawUser.currentStreak ?? stats.currentStreak ?? 0);
  const longestStreak = Number(
    rawUser.longestStreak ?? stats.longestStreak ?? currentStreak,
  );

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

  let progressPercent =
    rawUser.progressToNextLevelPercent ?? stats.progressToNextLevelPercent;
  if (typeof progressPercent !== 'number') {
    const range = nextLevelXp - currentLevelBaseXp;
    progressPercent =
      range > 0
        ? Math.round(
            Math.min(Math.max((xp - currentLevelBaseXp) / range, 0), 1) * 100,
          )
        : 0;
  }

  const equippedTheme = rawUser.equippedTheme ?? null;
  const equippedMedal = rawUser.equippedMedal ?? null;
  const equippedFrame = rawUser.equippedFrame ?? null;
  const equippedTitle = rawUser.equippedTitle ?? null;

  return {
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
    equippedThemeId: rawUser.equippedThemeId ?? equippedTheme?.id ?? null,
    equippedMedalId: rawUser.equippedMedalId ?? equippedMedal?.id ?? null,
    equippedFrameId: rawUser.equippedFrameId ?? equippedFrame?.id ?? null,
    equippedTitleId: rawUser.equippedTitleId ?? equippedTitle?.id ?? null,
    equippedTheme,
    equippedMedal,
    equippedFrame,
    equippedTitle,
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
};

const readInitialAuthState = (): {
  token: string | null;
  user: UserProfile | null;
} => {
  try {
    const token = localStorage.getItem('ploty_token');
    const cachedUserStr = localStorage.getItem('ploty_user');
    const user = cachedUserStr
      ? normalizeUserProfile(JSON.parse(cachedUserStr))
      : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const initialHydrated = readInitialAuthState();

const initialState: AuthState = {
  user: initialHydrated.user,
  token: initialHydrated.token,
  isAuthenticated: Boolean(initialHydrated.token),
  loading: false,
  error: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: {
      username: string;
      email: string;
      password: string;
      avatarUrl?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/auth/register', payload);
      const { access_token, user } = response.data;
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
        equippedThemeId?: string | null;
        equippedMedalId?: string | null;
        equippedFrameId?: string | null;
        equippedTitleId?: string | null;
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
      if (state.error?.toLowerCase().includes('unauthorized')) {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      }
    });

    // Reactive HUD update when an activity completes
    builder.addMatcher(
      (action) => action.type === 'activities/completeActivity/fulfilled',
      (state, action: any) => {
        const data = action.payload?.data;
        if (!data || !state.user) return;

        if (data.updatedUser) {
          state.user = normalizeUserProfile({
            ...state.user,
            ...data.updatedUser,
          });
          return;
        }

        const updatedStats = data.updatedStats || data.userStats;
        const rewards = data.rewards || data.reward || {};
        const xpEarned = Number(rewards.xpEarned ?? rewards.xpGained ?? 0);
        const coinsEarned = Number(rewards.coinsEarned ?? rewards.coinsGained ?? 0);

        const newXp = Number(updatedStats?.xp ?? state.user.xp + xpEarned);
        const newCoins = Number(
          updatedStats?.coins ?? state.user.coins + coinsEarned,
        );
        const newLevel = Number(
          updatedStats?.level ?? data.newLevel ?? state.user.level,
        );
        const newStreak = Number(
          updatedStats?.currentStreak ?? state.user.currentStreak,
        );
        const newLongestStreak = Number(
          updatedStats?.longestStreak ?? state.user.longestStreak,
        );

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

    // Reactive HUD update when equipping any of the 4 cosmetic slots
    builder.addMatcher(
      (action) => action.type === 'gamification/equipItem/fulfilled',
      (state, action: any) => {
        const payload = action.payload?.payload;
        if (!state.user || !payload) return;

        const returnedUser = action.payload?.data?.user;
        if (returnedUser) {
          state.user = normalizeUserProfile({
            ...state.user,
            ...returnedUser,
          });
          return;
        }

        if (payload.type === 'THEME') {
          const item = action.payload?.data?.equippedTheme || { id: payload.itemId };
          state.user = normalizeUserProfile({
            ...state.user,
            equippedThemeId: item.id,
            equippedTheme: item,
          });
        } else if (payload.type === 'MEDAL') {
          const item = action.payload?.data?.equippedMedal || { id: payload.itemId };
          state.user = normalizeUserProfile({
            ...state.user,
            equippedMedalId: item.id,
            equippedMedal: item,
          });
        } else if (payload.type === 'AVATAR_FRAME' || payload.type === 'FRAME') {
          const item = action.payload?.data?.equippedFrame || { id: payload.itemId };
          state.user = normalizeUserProfile({
            ...state.user,
            equippedFrameId: item.id,
            equippedFrame: item,
          });
        } else if (payload.type === 'TITLE') {
          const item = action.payload?.data?.equippedTitle || { id: payload.itemId };
          state.user = normalizeUserProfile({
            ...state.user,
            equippedTitleId: item.id,
            equippedTitle: item,
          });
        }
      },
    );
  },
});

export const { logout, clearAuthError, syncUserStats } = authSlice.actions;
export default authSlice.reducer;
