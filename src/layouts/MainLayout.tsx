import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { NavbarHUD } from '../components/NavbarHUD';
import { Sidebar } from '../components/Sidebar';
import { RewardToastManager } from '../components/RewardToastManager';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile } from '../store/slices/authSlice';
import { resolveThemeTokens, applyThemeToDocument } from '../common/fp/theme-resolver.fp';

export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [token, user, dispatch]);

  // Apply active equipped theme tokens to document root
  useEffect(() => {
    const tokens = resolveThemeTokens(user?.equippedTheme);
    applyThemeToDocument(tokens);
  }, [user?.equippedTheme]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-ploty-sage text-ploty-charcoal flex flex-col font-sans transition-colors">
      {/* Top Gamified HUD */}
      <NavbarHUD />

      {/* Main Workspace with Bento Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Dopamine Toast Feedback */}
      <RewardToastManager />
    </div>
  );
};
