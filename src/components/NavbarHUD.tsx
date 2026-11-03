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

  // Reactively calculate level progress percent
  const progressPercent =
    user.progressToNextLevelPercent ??
    user.progressPercent ??
    (user.nextLevelXp && user.nextLevelXp > (user.currentLevelBaseXp ?? 0)
      ? Math.round(
          Math.min(
            Math.max((xp - (user.currentLevelBaseXp ?? 0)) / (user.nextLevelXp - (user.currentLevelBaseXp ?? 0)), 0),
            1,
          ) * 100,
        )
      : 0);

  // Determine active frame and title (from gamificationSlice or user object)
  const activeFrame = equippedFrame || user.equippedFrame;
  const activeTitle = equippedTitle || user.equippedTitle;
  const activeMedal = equippedMedal || user.equippedMedal;

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-2.5 bg-[#1E1F28] text-white border-b-2 border-[#12131A] shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo - Perfectly Centered in Flex Box */}
        <div className="flex items-center gap-3 h-full select-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7477FF] to-[#F66554] flex items-center justify-center shadow-[2px_2px_0px_#12131A] border-2 border-white/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-white leading-none font-sans">
                PLOTY
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#7477FF]/40 border border-[#7477FF]/60 text-[9px] font-black tracking-widest text-[#B4B6FF] uppercase leading-none">
                BENTO
              </span>
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-white/70 uppercase leading-none mt-1">
              Tactile HUD
            </span>
          </div>
        </div>

        {/* Center Gamified HUD Counters with High-Contrast Solid Bento Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Level Badge with Animated XP Bar */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={springConfig.tactile}
            className="flex items-center gap-2.5 sm:gap-3 bg-[#2A2B37] px-3 sm:px-3.5 py-1.5 rounded-2xl border-2 border-[#3F4257] shadow-sm text-white"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#7477FF] text-white font-black text-sm shadow-sm border border-white/20 shrink-0">
              L{level}
            </div>
            <div className="flex flex-col min-w-[85px] sm:min-w-[120px]">
              <div className="flex justify-between items-center text-[11px] font-black text-white/90 mb-1 leading-none">
                <span>XP Progress</span>
                <span className="text-[#A5A7FF]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7477FF] to-[#F66554] rounded-full"
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
            className="flex items-center gap-1.5 bg-[#332226] border-2 border-[#F66554]/60 px-3 sm:px-3.5 py-1.5 rounded-2xl text-[#FFA094] shadow-sm font-black"
            title={`${streak} Días de Racha Activa`}
          >
            <Flame className="w-5 h-5 fill-[#F66554] text-[#F66554] animate-bounce shrink-0" />
            <span className="font-black text-sm text-white">{streak}</span>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#FFA094] hidden sm:inline">
              DÍAS
            </span>
          </motion.div>

          {/* Coins Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={springConfig.tactile}
            className="flex items-center gap-1.5 bg-[#332E1F] border-2 border-[#F9CD61]/60 px-3 sm:px-3.5 py-1.5 rounded-2xl text-[#F9CD61] shadow-sm font-black"
            title={`${coins} Monedas Ploty`}
          >
            <Coins className="w-5 h-5 fill-[#F9CD61]/40 text-[#F9CD61] shrink-0" />
            <span className="font-black text-sm text-white">{coins}</span>
          </motion.div>

          {/* Equipped Medal Pill */}
          {activeMedal && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springConfig.tactile}
              className="hidden lg:flex items-center gap-1.5 bg-[#252538] border-2 border-[#7477FF]/60 px-3.5 py-1.5 rounded-2xl text-[#B4B6FF] shadow-sm font-black"
              title={`Medalla Equipada: ${activeMedal.name}`}
            >
              <Shield className="w-4 h-4 fill-[#7477FF] text-[#7477FF] shrink-0" />
              <span className="font-black text-xs truncate max-w-[120px] text-white">
                {activeMedal.name}
              </span>
            </motion.div>
          )}
        </div>

        {/* User Profile Pill with Avatar Frame & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 bg-[#2A2B37] px-3 sm:px-3.5 py-1.5 rounded-2xl border-2 border-[#3F4257] shadow-sm text-white">
            {/* Avatar with optional animated Avatar Frame */}
            <div className="relative shrink-0">
              {activeFrame ? (
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#7477FF] via-[#F66554] to-[#F9CD61] shadow-sm animate-pulse">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#7477FF] flex items-center justify-center text-white font-black text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ) : user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#7477FF]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#7477FF]/40 border-2 border-[#7477FF] flex items-center justify-center text-white font-black text-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Username & Equipped Title */}
            <div className="hidden md:flex flex-col text-left justify-center">
              <span className="font-black text-xs text-white leading-none">
                {user.username}
              </span>
              {activeTitle ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F9CD61] leading-none mt-1">
                  {activeTitle.name}
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-white/70 leading-none mt-1">
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
            className="p-2 rounded-2xl bg-[#332226] hover:bg-[#44282D] text-[#FFA094] border-2 border-[#F66554]/50 transition-colors cursor-pointer shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
