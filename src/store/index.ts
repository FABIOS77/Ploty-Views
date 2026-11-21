import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer, {
  fetchUserProfile,
  loginUser,
  logout,
  registerUser,
  syncUserStats,
} from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import activitiesReducer, { completeActivity } from './slices/activitiesSlice';
import gamificationReducer, { equipItem } from './slices/gamificationSlice';
import reportsReducer from './slices/reportsSlice';

/**
 * Side-effect isolation layer:
 * Keeps authSlice reducers & normalizeUserProfile 100% pure while
 * persisting JWT token and normalized user profile to localStorage reactively.
 */
const authPersistenceMiddleware = createListenerMiddleware();

authPersistenceMiddleware.startListening({
  matcher: isAnyOf(
    loginUser.fulfilled,
    registerUser.fulfilled,
    fetchUserProfile.fulfilled,
    syncUserStats,
    completeActivity.fulfilled,
    equipItem.fulfilled,
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as {
      auth: { token: string | null; user: unknown };
    };
    try {
      if (state.auth.token) {
        localStorage.setItem('ploty_token', state.auth.token);
      }
      if (state.auth.user) {
        localStorage.setItem('ploty_user', JSON.stringify(state.auth.user));
      }
    } catch {
      // Ignore storage quota / private-mode restrictions
    }
  },
});

authPersistenceMiddleware.startListening({
  matcher: isAnyOf(logout, fetchUserProfile.rejected),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as {
      auth: { token: string | null };
    };
    if (action.type === logout.type || !state.auth.token) {
      try {
        localStorage.removeItem('ploty_token');
        localStorage.removeItem('ploty_user');
      } catch {
        // Ignore storage errors
      }
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    activities: activitiesReducer,
    gamification: gamificationReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(authPersistenceMiddleware.middleware),
});

// Listen for 401 unauthorized events dispatched by Axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('ploty:unauthorized', () => {
    store.dispatch(logout());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
