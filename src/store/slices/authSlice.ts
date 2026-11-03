import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
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
  xpForNextLevel?: number;
  xpCurrentLevel?: number;
  progressPercent?: number;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialToken = localStorage.getItem('ploty_token');

const initialState: AuthState = {
  user: null,
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
      return { token: access_token, user };
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
      return { token: access_token, user };
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
      return response.data;
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
        equippedMedal?: GamificationCosmetic | null;
        equippedTheme?: GamificationCosmetic | null;
      }>,
    ) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
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
      }
    });
  },
});

export const { logout, clearAuthError, syncUserStats } = authSlice.actions;
export default authSlice.reducer;
