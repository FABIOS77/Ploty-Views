import { describe, it, expect } from 'vitest';
import authReducer, {
  logout,
  clearAuthError,
  syncUserStats,
  type AuthState,
} from './authSlice';

describe('Auth Redux Slice (authSlice.ts)', () => {
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

  it('handles logout action and clears user/token', () => {
    const state = authReducer(initialTestState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
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
});
