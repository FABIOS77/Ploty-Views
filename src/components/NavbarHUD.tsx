import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Coins, Shield, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { springConfig } from '../common/motion/motion-skills';

export const NavbarHUD: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { equippedFrame, equippedTitle, equippedMedal } = useAppSelector(
    (state) => state.gamification,
  );

  if (!user) return null;

  const level = user.level || 1;
  const xp = user.xp || 0;
  const coins = user.coins || 0;
  const streak = user.currentStreak || 0;
  // Calculate level progress (default 100 XP per level tier if not specified)
  const currentTierXp = user.xpCurrentLevel ?? xp % 100;
  const nextTierXp = user.xpForNextLevel ?? 100;
  const progressPercent = user.progressPercent ?? Math.min(100, Math.round((currentTierXp / nextTierXp) * 100));

  // Determine active frame and title (from gamificationSlice or user object)
  const activeFrame = equippedFrame || user.equippedFrame;
  const activeTitle = equippedTitle || user.equippedTitle;
  const activeMedal = equippedMedal || user.equippedMedal;

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-3 bg-ploty-dark/95 backdrop-blur-md border-b border-ploty-white/10 shadow-tactile transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-primary flex items-center justify-center shadow-tactile-sm">
            <Sparkles className="w-6 h-6 text-ploty-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-ploty-white tracking-wider font-sans">
              PLOTY
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-ploty-sage uppercase">
              Tactile Bento HUD
            </span>
          </div>
        </div>

        {/* Center Gamified HUD Counters */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          {/* Level Badge with Animated XP Bar */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={springConfig.tactile}
            className="flex items-center gap-3 bg-ploty-white/10 px-3.5 py-1.5 rounded-2xl border border-ploty-white/10"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-ploty-primary text-ploty-white font-black text-sm shadow-sm">
              L{level}
            </div>
            <div className="flex flex-col min-w-[90px] sm:min-w-[120px]">
              <div className="flex justify-between items-center text-[11px] font-bold text-ploty-white/80 mb-1">
                <span>XP Progress</span>
                <span className="text-ploty-primary">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-ploty-charcoal overflow-hidden border border-ploty-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-ploty-primary to-ploty-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Streak Flame */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={springConfig.tactile}
            className="flex items-center gap-1.5 bg-ploty-coral/15 border border-ploty-coral/30 px-3 py-1.5 rounded-2xl text-ploty-coral"
            title={`${streak} Días de Racha Activa`}
          >
            <Flame className="w-5 h-5 fill-ploty-coral animate-bounce" />
            <span className="font-extrabold text-sm">{streak}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
              días
            </span>
          </motion.div>

          {/* Coins Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={springConfig.tactile}
            className="flex items-center gap-1.5 bg-ploty-gold/15 border border-ploty-gold/30 px-3 py-1.5 rounded-2xl text-ploty-gold"
            title={`${coins} Monedas Ploty`}
          >
            <Coins className="w-5 h-5 fill-ploty-gold/40" />
            <span className="font-extrabold text-sm">{coins}</span>
          </motion.div>

          {/* Equipped Medal Pill */}
          {activeMedal && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springConfig.tactile}
              className="hidden lg:flex items-center gap-1.5 bg-ploty-primary/20 border border-ploty-primary/40 px-3 py-1.5 rounded-2xl text-ploty-primary shadow-sm"
              title={`Medalla Equipada: ${activeMedal.name}`}
            >
              <Shield className="w-4 h-4 fill-ploty-primary" />
              <span className="font-bold text-xs truncate max-w-[110px]">
                {activeMedal.name}
              </span>
            </motion.div>
          )}
        </div>

        {/* User Profile Pill with Avatar Frame & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-ploty-white/10 px-3 py-1.5 rounded-2xl border border-ploty-white/10">
            {/* Avatar with optional animated Avatar Frame */}
            <div className="relative">
              {activeFrame ? (
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-ploty-primary via-ploty-accent to-ploty-gold shadow-neon animate-pulse">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-ploty-primary/40 flex items-center justify-center text-ploty-white font-bold text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ) : user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-ploty-primary"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ploty-primary/30 flex items-center justify-center text-ploty-white font-bold text-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Username & Equipped Title */}
            <div className="hidden md:flex flex-col text-left">
              <span className="font-bold text-sm text-ploty-white leading-tight">
                {user.username}
              </span>
              {activeTitle ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-ploty-gold leading-tight">
                  {activeTitle.name}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-ploty-white/50 leading-tight">
                  Jugador Nivel {level}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(logout())}
            title="Cerrar sesión"
            className="p-2 rounded-2xl bg-ploty-coral/10 hover:bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
