import { describe, it, expect } from 'vitest';
import gamificationReducer, {
  queueRewardNotification,
  dismissRewardNotification,
  clearAllRewardNotifications,
  setPreviewTheme,
  clearPreviewTheme,
  type GamificationState,
  type CatalogItem,
} from './gamificationSlice';

describe('Gamification Redux Slice (gamificationSlice.ts)', () => {
  const initialTestState: GamificationState = {
    catalog: [],
    leaderboard: [],
    equippedTheme: null,
    equippedMedal: null,
    equippedFrame: null,
    equippedTitle: null,
    previewTheme: null,
    rewardQueue: [],
    loading: false,
    actionLoading: false,
    error: null,
  };

  it('queues a floating dopamine reward notification', () => {
    const state = gamificationReducer(
      initialTestState,
      queueRewardNotification({
        title: 'Complete 5 Tasks in a Row',
        xp: 150,
        coins: 80,
        leveledUp: true,
        newLevel: 3,
        medalName: 'Streak Master',
      }),
    );
    expect(state.rewardQueue.length).toBe(1);
    expect(state.rewardQueue[0].title).toBe('Complete 5 Tasks in a Row');
    expect(state.rewardQueue[0].xp).toBe(150);
    expect(state.rewardQueue[0].leveledUp).toBe(true);
    expect(state.rewardQueue[0].id).toBeDefined();
  });

  it('dismisses a notification by id', () => {
    const stateWithItem: GamificationState = {
      ...initialTestState,
      rewardQueue: [
        {
          id: 'reward-123',
          title: 'Daily Streak',
          xp: 20,
          coins: 10,
          createdAt: Date.now(),
        },
      ],
    };

    const state = gamificationReducer(
      stateWithItem,
      dismissRewardNotification('reward-123'),
    );
    expect(state.rewardQueue.length).toBe(0);
  });

  it('clears all notifications at once', () => {
    const stateWithItems: GamificationState = {
      ...initialTestState,
      rewardQueue: [
        { id: '1', title: 'A', xp: 10, coins: 5, createdAt: 1 },
        { id: '2', title: 'B', xp: 20, coins: 10, createdAt: 2 },
      ],
    };

    const state = gamificationReducer(stateWithItems, clearAllRewardNotifications());
    expect(state.rewardQueue.length).toBe(0);
  });

  it('sets and clears a theme live preview', () => {
    const dummyTheme: CatalogItem = {
      id: 'thm-1',
      code: 'THEME_CYBERPUNK_NEON',
      name: 'Cyberpunk Neon',
      description: 'Neon theme',
      type: 'THEME',
      unlockLevel: 2,
      costCoins: 100,
      isUnlocked: true,
      isEquipped: false,
      canAfford: true,
    };

    const previewState = gamificationReducer(initialTestState, setPreviewTheme(dummyTheme));
    expect(previewState.previewTheme?.code).toBe('THEME_CYBERPUNK_NEON');

    const clearedState = gamificationReducer(previewState, clearPreviewTheme());
    expect(clearedState.previewTheme).toBeNull();
  });
});
