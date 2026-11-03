import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Coins, Shield, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { springConfig } from '../common/motion/motion-skills';

export const NavbarHUD: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const level = user.level || 1;
  const xp = user.xp || 0;
  const coins = user.coins || 0;
  const streak = user.currentStreak || 0;
  // Calculate level progress (default 100 XP per level tier if not specified)
  const currentTierXp = user.xpCurrentLevel ?? xp % 100;
  const nextTierXp = user.xpForNextLevel ?? 100;
  const progressPercent = user.progressPercent ?? Math.min(100, Math.round((currentTierXp / nextTierXp) * 100));

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-3 bg-ploty-charcoal/95 backdrop-blur-md border-b border-ploty-charcoal/20 shadow-tactile transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-periwinkle flex items-center justify-center shadow-tactile-sm">
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
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-ploty-periwinkle text-ploty-white font-black text-sm shadow-sm">
              L{level}
            </div>
            <div className="flex flex-col min-w-[90px] sm:min-w-[120px]">
              <div className="flex justify-between items-center text-[11px] font-bold text-ploty-white/80 mb-1">
                <span>XP Progress</span>
                <span className="text-ploty-periwinkle">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-ploty-charcoal overflow-hidden border border-ploty-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-ploty-periwinkle to-ploty-coral rounded-full"
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
            title={`${streak} Days Streak`}
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
            title={`${coins} Ploty Coins`}
          >
            <Coins className="w-5 h-5 fill-ploty-gold/40" />
            <span className="font-extrabold text-sm">{coins}</span>
          </motion.div>

          {/* Equipped Medal Pill (if present) */}
          {user.equippedMedal && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springConfig.tactile}
              className="hidden lg:flex items-center gap-1.5 bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 px-3 py-1.5 rounded-2xl text-ploty-periwinkle"
              title={`Equipped Medal: ${user.equippedMedal.name}`}
            >
              <Shield className="w-4 h-4 fill-ploty-periwinkle" />
              <span className="font-bold text-xs truncate max-w-[100px]">
                {user.equippedMedal.name}
              </span>
            </motion.div>
          )}
        </div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-ploty-white/10 px-3 py-1.5 rounded-2xl border border-ploty-white/10">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover border border-ploty-periwinkle"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-ploty-periwinkle/30 flex items-center justify-center text-ploty-white font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <span className="font-bold text-sm text-ploty-white hidden md:inline">
              {user.username}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(logout())}
            title="Cerrar sesión"
            className="p-2 rounded-2xl bg-ploty-coral/10 hover:bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
