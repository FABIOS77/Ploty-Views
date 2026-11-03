import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  logout,
  clearAuthError,
  syncUserStats,
  normalizeUserProfile,
  type AuthState,
} from './authSlice';

describe('Auth Redux Slice (authSlice.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const initialTestState: AuthState = {
    user: {
      id: 'usr-1',
      username: 'alex_hero',
      email: 'alex@ploty.app',
      xp: 200,
      level: 2,
      coins: 50,
      currentStreak: 3,
      longestStreak: 5,
      nextLevelXp: 400,
      currentLevelBaseXp: 100,
      progressToNextLevelPercent: 33,
      progressPercent: 33,
    },
    token: 'jwt-token-123',
    isAuthenticated: true,
    loading: false,
    error: 'Previous error',
  };

  it('handles clearAuthError action', () => {
    const state = authReducer(initialTestState, clearAuthError());
    expect(state.error).toBeNull();
  });

  it('handles logout action and clears user/token from state and localStorage', () => {
    localStorage.setItem('ploty_token', 'jwt-token-123');
    localStorage.setItem('ploty_user', JSON.stringify({ id: 'usr-1' }));

    const state = authReducer(initialTestState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('ploty_token')).toBeNull();
    expect(localStorage.getItem('ploty_user')).toBeNull();
  });

  it('handles syncUserStats to update gamified level and coins immediately', () => {
    const state = authReducer(
      initialTestState,
      syncUserStats({
        xp: 350,
        level: 3,
        coins: 100,
        currentStreak: 4,
      }),
    );
    expect(state.user?.xp).toBe(350);
    expect(state.user?.level).toBe(3);
    expect(state.user?.coins).toBe(100);
    expect(state.user?.currentStreak).toBe(4);
    // Preserves other fields
    expect(state.user?.username).toBe('alex_hero');
  });

  describe('normalizeUserProfile pure function', () => {
    it('normalizes flat user object exposing root and stats compatibility', () => {
      const flatRaw = {
        id: 'u-1',
        username: 'hero',
        email: 'hero@test.com',
        xp: 158,
        level: 2,
        coins: 75,
        currentStreak: 2,
        longestStreak: 4,
      };

      const normalized = normalizeUserProfile(flatRaw);
      expect(normalized).not.toBeNull();
      expect(normalized?.xp).toBe(158);
      expect(normalized?.level).toBe(2);
      expect(normalized?.coins).toBe(75);
      expect(normalized?.currentStreak).toBe(2);
      expect(normalized?.nextLevelXp).toBe(400);
      expect(normalized?.currentLevelBaseXp).toBe(100);
      // Progress percent: (158 - 100) / (400 - 100) = 58 / 300 = 19%
      expect(normalized?.progressToNextLevelPercent).toBe(19);
      expect(normalized?.stats?.xp).toBe(158);
      expect(normalized?.stats?.coins).toBe(75);
    });

    it('normalizes nested user.stats from backend response', () => {
      const nestedBackendRaw = {
        id: 'u-2',
        username: 'fabio',
        email: 'fabio@test.com',
        stats: {
          xp: 500,
          level: 3,
          coins: 120,
          currentStreak: 5,
          longestStreak: 7,
          nextLevelXp: 900,
          currentLevelBaseXp: 400,
          progressToNextLevelPercent: 20,
        },
        equippedTheme: { code: 'THEME_DEFAULT_PLOTY' },
      };

      const normalized = normalizeUserProfile(nestedBackendRaw);
      expect(normalized).not.toBeNull();
      expect(normalized?.xp).toBe(500);
      expect(normalized?.level).toBe(3);
      expect(normalized?.coins).toBe(120);
      expect(normalized?.currentStreak).toBe(5);
      expect(normalized?.progressToNextLevelPercent).toBe(20);
      expect(normalized?.equippedTheme?.code).toBe('THEME_DEFAULT_PLOTY');
    });

    it('persists normalized user to localStorage', () => {
      normalizeUserProfile({
        id: 'u-saved',
        username: 'persisted_user',
        xp: 100,
        coins: 50,
      });

      const saved = localStorage.getItem('ploty_user');
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.username).toBe('persisted_user');
      expect(parsed.xp).toBe(100);
    });

    it('safely returns null when input is null or undefined', () => {
      expect(normalizeUserProfile(null)).toBeNull();
      expect(normalizeUserProfile(undefined)).toBeNull();
    });
  });

  describe('extraReducers matchers', () => {
    it('reactively updates user stats when completeActivity.fulfilled is dispatched', () => {
      const action = {
        type: 'activities/completeActivity/fulfilled',
        payload: {
          data: {
            rewards: { xpEarned: 100, coinsEarned: 50 },
            updatedStats: {
              xp: 300,
              level: 2,
              coins: 100,
              currentStreak: 4,
              longestStreak: 5,
              progressToNextLevelPercent: 67,
            },
          },
        },
      };

      const state = authReducer(initialTestState, action);
      expect(state.user?.xp).toBe(300);
      expect(state.user?.coins).toBe(100);
      expect(state.user?.currentStreak).toBe(4);
      expect(state.user?.progressToNextLevelPercent).toBe(67);
    });

    it('reactively updates equippedTheme when equipItem.fulfilled is dispatched', () => {
      const action = {
        type: 'gamification/equipItem/fulfilled',
        payload: {
          payload: { itemId: 'theme-1', type: 'THEME' },
          data: {
            equippedTheme: { id: 'theme-1', code: 'THEME_DEFAULT_PLOTY', name: 'Ploty Indigo Core' },
          },
        },
      };

      const state = authReducer(initialTestState, action);
      expect(state.user?.equippedTheme?.code).toBe('THEME_DEFAULT_PLOTY');
    });
  });
});
