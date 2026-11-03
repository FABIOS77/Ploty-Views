import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { NavbarHUD } from '../components/NavbarHUD';
import { Sidebar } from '../components/Sidebar';
import { RewardToastManager } from '../components/RewardToastManager';
import { LevelUpAndUnlockModal } from '../components/LevelUpAndUnlockModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile } from '../store/slices/authSlice';
import { clearPreviewTheme } from '../store/slices/gamificationSlice';
import { resolveThemeTokens, applyThemeToDocument } from '../common/fp/theme-resolver.fp';
import { Eye, RotateCcw } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const previewTheme = useAppSelector((state) => state.gamification.previewTheme);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [token, dispatch]);

  // Apply active or preview theme tokens to document root
  useEffect(() => {
    const activeItem = previewTheme || user?.equippedTheme;
    const tokens = resolveThemeTokens(activeItem);
    applyThemeToDocument(tokens);
  }, [user?.equippedTheme, previewTheme]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-ploty-sage text-ploty-charcoal flex flex-col font-sans transition-colors">
      {/* Floating Theme Live Preview Banner */}
      {previewTheme && (
        <div className="bg-ploty-primary text-ploty-white px-4 py-2 flex items-center justify-between text-xs font-black shadow-tactile-sm z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse" />
            <span>
              Previsualizando Tema: <strong>{previewTheme.name}</strong>
            </span>
          </div>
          <button
            onClick={() => dispatch(clearPreviewTheme())}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-ploty-white/20 hover:bg-ploty-white/30 text-ploty-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar Tema Anterior
          </button>
        </div>
      )}

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

      {/* Epic Celebration Modal for Level Up & Medals */}
      <LevelUpAndUnlockModal />
    </div>
  );
};
