import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Shield, X, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCompletedReward } from '../store/slices/activitiesSlice';
import { equipItem } from '../store/slices/gamificationSlice';
import { triggerLevelUpCelebration } from '../common/motion/confetti';
import { springConfig } from '../common/motion/motion-skills';

export const LevelUpAndUnlockModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const lastReward = useAppSelector((state) => state.activities.lastReward);

  const isCelebration =
    Boolean(lastReward?.leveledUp) ||
    Boolean(lastReward?.unlockedMedals && lastReward.unlockedMedals.length > 0);

  useEffect(() => {
    if (isCelebration) {
      triggerLevelUpCelebration();
    }
  }, [isCelebration]);

  if (!isCelebration || !lastReward) return null;

  const handleEquipUnlocked = (medalId: string) => {
    dispatch(equipItem({ itemId: medalId, type: 'MEDAL' }));
    dispatch(clearCompletedReward());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ploty-charcoal/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={springConfig.bouncy}
          className="relative w-full max-w-md bg-ploty-card text-ploty-charcoal p-8 rounded-4xl shadow-tactile border-4 border-ploty-gold overflow-hidden text-center"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-ploty-gold/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-ploty-periwinkle/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => dispatch(clearCompletedReward())}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-ploty-charcoal/10 hover:bg-ploty-charcoal/20 text-ploty-charcoal transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springConfig.bouncy, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-ploty-gold to-ploty-coral flex items-center justify-center text-ploty-white shadow-tactile mb-4"
          >
            <Trophy className="w-10 h-10 animate-bounce" />
          </motion.div>

          <span className="inline-block px-3 py-1 rounded-full bg-ploty-gold/20 text-ploty-charcoal font-black text-xs uppercase tracking-widest mb-2 border border-ploty-gold/40">
            ¡Hito de Progreso Alcanzado!
          </span>

          {lastReward.leveledUp ? (
            <div className="space-y-1 mb-4">
              <h3 className="text-3xl font-black tracking-tight text-ploty-charcoal">
                ¡SUBISTE AL NIVEL {lastReward.newLevel}!
              </h3>
              <p className="text-xs text-ploty-charcoal/70">
                Tu consistencia desbloqueó nuevos multiplicadores de XP y cosméticos en la tienda.
              </p>
            </div>
          ) : (
            <div className="space-y-1 mb-4">
              <h3 className="text-2xl font-black tracking-tight text-ploty-charcoal">
                ¡Nueva Medalla Desbloqueada!
              </h3>
              <p className="text-xs text-ploty-charcoal/70">
                Has demostrado maestría en tus actividades diarias.
              </p>
            </div>
          )}

          {/* Unlocked Medals Display */}
          {lastReward.unlockedMedals && lastReward.unlockedMedals.length > 0 && (
            <div className="my-4 p-4 rounded-3xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-ploty-charcoal/70">
                <Shield className="w-4 h-4 text-ploty-periwinkle" />
                <span>Medalla Disponible</span>
              </div>
              {lastReward.unlockedMedals.map((medal: any) => (
                <div key={medal.id} className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-sm font-black">{medal.name}</p>
                    <p className="text-[11px] text-ploty-charcoal/60">{medal.description}</p>
                  </div>
                  <button
                    onClick={() => handleEquipUnlocked(medal.id)}
                    className="px-3 py-1.5 rounded-xl bg-ploty-periwinkle text-ploty-white text-xs font-black hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
                  >
                    Equipar <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stats Rewarded Pill */}
          <div className="flex items-center justify-center gap-4 py-3 border-t border-b border-ploty-charcoal/10 my-4">
            <span className="flex items-center gap-1 text-sm font-black text-ploty-periwinkle">
              <Sparkles className="w-4 h-4" /> +{lastReward.xpGained} XP
            </span>
            <span className="flex items-center gap-1 text-sm font-black text-ploty-gold">
              +{lastReward.coinsGained} Monedas
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatch(clearCompletedReward())}
            className="w-full py-3.5 px-6 rounded-2xl bg-ploty-charcoal hover:bg-ploty-charcoal/90 text-ploty-white font-black text-sm tracking-wider shadow-tactile-sm transition-all cursor-pointer"
          >
            ¡Continuar Jugando!
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
