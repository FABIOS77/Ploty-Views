import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Sparkles,
  Coins,
  Shield,
  Palette,
  Check,
  Lock,
  Trophy,
  Flame,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCatalog,
  buyItem,
  equipItem,
  fetchLeaderboard,
  type CatalogItem,
} from '../../store/slices/gamificationSlice';
import { syncUserStats } from '../../store/slices/authSlice';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { StaggerContainer, StaggerItem } from '../../common/motion/StaggerList';
import { springConfig } from '../../common/motion/motion-skills';

export const ShopPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { catalog, leaderboard, actionLoading } = useAppSelector(
    (state) => state.gamification,
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<'catalog' | 'leaderboard'>('catalog');

  useEffect(() => {
    dispatch(fetchCatalog());
    dispatch(fetchLeaderboard(undefined));
  }, [dispatch]);

  const handleBuy = async (item: CatalogItem) => {
    if (!item.canAfford && (currentUser?.coins ?? 0) < item.costCoins) return;

    const res = await dispatch(buyItem(item.id));
    if (buyItem.fulfilled.match(res)) {
      // Deduct coins from Redux user HUD immediately
      if (currentUser) {
        dispatch(
          syncUserStats({
            coins: Math.max(0, (currentUser.coins || 0) - item.costCoins),
          }),
        );
      }
      dispatch(fetchCatalog());
    }
  };

  const handleEquip = async (item: CatalogItem) => {
    const res = await dispatch(
      equipItem({ itemId: item.id, type: item.type as 'THEME' | 'MEDAL' }),
    );
    if (equipItem.fulfilled.match(res)) {
      if (item.type === 'THEME') {
        dispatch(syncUserStats({ equippedTheme: item }));
      } else if (item.type === 'MEDAL') {
        dispatch(syncUserStats({ equippedMedal: item }));
      }
      dispatch(fetchCatalog());
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-gold/20 border border-ploty-gold/40 text-ploty-gold text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Tienda Gamificada & Salón de la Fama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Recompensas & Clasificación
          </h2>
          <p className="text-sm text-ploty-sage/80 max-w-xl">
            Invierte tus monedas ganadas en temas Bento exclusivos y medallas honoríficas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-ploty-white/10 p-1.5 rounded-2xl border border-ploty-white/10">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'catalog'
                ? 'bg-ploty-gold text-ploty-charcoal shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-ploty-periwinkle text-ploty-white shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            Clasificación
          </button>
        </div>
      </motion.div>

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map((item) => {
            const isTheme = item.type === 'THEME';
            const userLevel = currentUser?.level || 1;
            const userCoins = currentUser?.coins || 0;
            const levelLocked = userLevel < item.unlockLevel;
            const cannotAfford = userCoins < item.costCoins && !item.isUnlocked;

            return (
              <StaggerItem key={item.id}>
                <BentoSpringCard className="bg-ploty-white text-ploty-charcoal p-6 rounded-3xl shadow-tactile border-2 border-ploty-charcoal/10 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    {/* Item Type & Status */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-ploty-sage/30 text-ploty-charcoal">
                        {isTheme ? <Palette className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {item.type}
                      </span>

                      {item.isEquipped ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/30">
                          <Check className="w-3 h-3" /> Equipado
                        </span>
                      ) : item.isUnlocked ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-ploty-periwinkle/20 text-ploty-periwinkle">
                          Desbloqueado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-black text-ploty-gold">
                          <Coins className="w-4 h-4" /> {item.costCoins}
                        </span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div>
                      <h4 className="font-black text-base leading-snug">{item.name}</h4>
                      <p className="text-xs text-ploty-charcoal/70 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Level Lock Indicator */}
                    {levelLocked && !item.isUnlocked && (
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold text-ploty-charcoal/70">
                        <Lock className="w-3.5 h-3.5 text-ploty-coral" />
                        <span>Requiere Nivel {item.unlockLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-ploty-charcoal/10">
                    {item.isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-ploty-sage/30 text-ploty-charcoal/60 font-black text-xs cursor-default"
                      >
                        En Uso Actualmente
                      </button>
                    ) : item.isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-2xl bg-ploty-periwinkle hover:bg-ploty-periwinkle/90 text-ploty-white font-black text-xs shadow-tactile-sm transition-all cursor-pointer"
                      >
                        Equipar {isTheme ? 'Tema' : 'Medalla'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={levelLocked || cannotAfford || actionLoading}
                        className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-tactile-sm transition-all ${
                          levelLocked || cannotAfford
                            ? 'bg-ploty-charcoal/20 text-ploty-charcoal/40 cursor-not-allowed'
                            : 'bg-ploty-gold hover:bg-ploty-gold/90 text-ploty-charcoal cursor-pointer'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Comprar por {item.costCoins} Monedas</span>
                      </button>
                    )}
                  </div>
                </BentoSpringCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* Leaderboard View */}
      {activeTab === 'leaderboard' && (
        <div className="bg-ploty-white text-ploty-charcoal rounded-3xl shadow-tactile p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-ploty-charcoal/10">
            <Trophy className="w-6 h-6 text-ploty-gold" />
            <div>
              <h3 className="text-lg font-black">Top Jugadores de la Comunidad</h3>
              <p className="text-xs text-ploty-charcoal/70">
                Puntaje acumulado por XP y consistencia de rachas activas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player, idx) => {
              const rankColor =
                idx === 0
                  ? 'bg-ploty-gold text-ploty-charcoal'
                  : idx === 1
                  ? 'bg-ploty-sage text-ploty-charcoal'
                  : idx === 2
                  ? 'bg-ploty-coral text-ploty-white'
                  : 'bg-ploty-charcoal/10 text-ploty-charcoal/70';

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    player.id === currentUser?.id
                      ? 'border-2 border-ploty-periwinkle bg-ploty-periwinkle/5'
                      : 'border-ploty-charcoal/10 bg-ploty-sage/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm ${rankColor}`}
                    >
                      #{player.rank || idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-9 h-9 rounded-full object-cover border border-ploty-charcoal/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-ploty-periwinkle/20 text-ploty-periwinkle font-black text-xs flex items-center justify-center">
                          {player.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm">{player.username}</p>
                          {player.id === currentUser?.id && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-ploty-periwinkle text-ploty-white">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-ploty-charcoal/60">
                          Nivel {player.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-ploty-coral text-xs font-black">
                      <Flame className="w-4 h-4 fill-ploty-coral" />
                      <span>{player.currentStreak || 0}d</span>
                    </div>

                    <div className="flex items-center gap-1 text-ploty-periwinkle text-xs font-black min-w-[70px] justify-end">
                      <Sparkles className="w-4 h-4" />
                      <span>{player.xp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
