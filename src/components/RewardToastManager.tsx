import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Coins, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { dismissRewardNotification } from '../store/slices/gamificationSlice';
import { springConfig } from '../common/motion/motion-skills';

export const RewardToastManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const rewardQueue = useAppSelector((state) => state.gamification.rewardQueue);

  // Auto-dismiss the oldest notification after 4 seconds
  useEffect(() => {
    if (rewardQueue.length > 0) {
      const timer = setTimeout(() => {
        dispatch(dismissRewardNotification(rewardQueue[0].id));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [rewardQueue, dispatch]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {rewardQueue.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
            transition={springConfig.bouncy}
            className="pointer-events-auto bg-ploty-charcoal text-ploty-white p-4 rounded-3xl border-2 border-ploty-gold/60 shadow-tactile flex flex-col gap-2 relative overflow-hidden"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ploty-periwinkle via-ploty-gold to-ploty-coral" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-ploty-gold/20 text-ploty-gold flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 fill-ploty-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight text-ploty-white">
                    ¡Recompensa Desbloqueada!
                  </h4>
                  <p className="text-xs text-ploty-sage/80 line-clamp-1">
                    {reward.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dispatch(dismissRewardNotification(reward.id))}
                className="text-ploty-white/50 hover:text-ploty-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reward badges */}
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" /> +{reward.xp} XP
              </span>

              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-ploty-gold/20 border border-ploty-gold/40 text-ploty-gold text-xs font-black">
                <Coins className="w-3.5 h-3.5" /> +{reward.coins} Monedas
              </span>

              {reward.leveledUp && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-ploty-coral/20 border border-ploty-coral/40 text-ploty-coral text-xs font-black animate-pulse">
                  <Trophy className="w-3.5 h-3.5" /> ¡Nivel {reward.newLevel || '+1'}!
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
