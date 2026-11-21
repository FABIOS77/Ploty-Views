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
      equippedFrameId: null,
      equippedTitleId: null,
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

  it('handles logout action and clears user/token from state purely', () => {
    const state = authReducer(initialTestState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('handles syncUserStats to update gamified level, coins, and cosmetics immediately', () => {
    const state = authReducer(
      initialTestState,
      syncUserStats({
        xp: 350,
        level: 3,
        coins: 100,
        currentStreak: 4,
        equippedFrameId: 'frame-plasma',
        equippedTitleId: 'title-arch',
      }),
    );
    expect(state.user?.xp).toBe(350);
    expect(state.user?.level).toBe(3);
    expect(state.user?.coins).toBe(100);
    expect(state.user?.currentStreak).toBe(4);
    expect(state.user?.equippedFrameId).toBe('frame-plasma');
    expect(state.user?.equippedTitleId).toBe('title-arch');
    expect(state.user?.username).toBe('alex_hero');
  });

  describe('normalizeUserProfile pure function (zero side effects)', () => {
    it('normalizes flat user object exposing root, stats, and cosmetic IDs', () => {
      const flatRaw = {
        id: 'u-1',
        username: 'hero',
        email: 'hero@test.com',
        xp: 158,
        level: 2,
        coins: 75,
        currentStreak: 2,
        longestStreak: 4,
        equippedFrameId: 'f-1',
        equippedTitleId: 't-1',
      };

      const normalized = normalizeUserProfile(flatRaw);
      expect(normalized).not.toBeNull();
      expect(normalized?.xp).toBe(158);
      expect(normalized?.level).toBe(2);
      expect(normalized?.coins).toBe(75);
      expect(normalized?.currentStreak).toBe(2);
      expect(normalized?.nextLevelXp).toBe(400);
      expect(normalized?.currentLevelBaseXp).toBe(100);
      expect(normalized?.progressToNextLevelPercent).toBe(19);
      expect(normalized?.equippedFrameId).toBe('f-1');
      expect(normalized?.equippedTitleId).toBe('t-1');
      expect(normalized?.stats?.xp).toBe(158);
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
        equippedTheme: { id: 'th-1', code: 'THEME_DEFAULT_PLOTY' },
        equippedFrame: { id: 'fr-1', code: 'FRAME_PLASMA_RING' },
        equippedTitle: { id: 'ti-1', code: 'TITLE_ARCHITECT' },
      };

      const normalized = normalizeUserProfile(nestedBackendRaw);
      expect(normalized?.xp).toBe(500);
      expect(normalized?.level).toBe(3);
      expect(normalized?.coins).toBe(120);
      expect(normalized?.equippedThemeId).toBe('th-1');
      expect(normalized?.equippedFrameId).toBe('fr-1');
      expect(normalized?.equippedTitleId).toBe('ti-1');
    });

    it('produces ZERO side effects (does NOT mutate localStorage)', () => {
      expect(localStorage.getItem('ploty_user')).toBeNull();

      normalizeUserProfile({
        id: 'u-pure',
        username: 'pure_user',
        xp: 100,
        coins: 50,
      });

      expect(localStorage.getItem('ploty_user')).toBeNull();
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

    it('reactively updates equippedTheme, frame and title when equipItem.fulfilled is dispatched', () => {
      const action = {
        type: 'gamification/equipItem/fulfilled',
        payload: {
          payload: { itemId: 'frame-1', type: 'AVATAR_FRAME' },
          data: {
            user: {
              ...initialTestState.user,
              equippedFrameId: 'frame-1',
              equippedFrame: { id: 'frame-1', code: 'FRAME_PLASMA_RING', name: 'Anillo de Plasma' },
            },
          },
        },
      };

      const state = authReducer(initialTestState, action);
      expect(state.user?.equippedFrameId).toBe('frame-1');
      expect(state.user?.equippedFrame?.code).toBe('FRAME_PLASMA_RING');
    });
  });
});
