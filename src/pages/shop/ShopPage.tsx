import React, { useEffect, useState, useMemo } from 'react';
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
  Eye,
  Crown,
  Tag,
  CircleDot,
  FolderKanban,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCatalog,
  buyItem,
  equipItem,
  fetchLeaderboard,
  setPreviewTheme,
  clearPreviewTheme,
  equipLocalCosmetic,
  type CatalogItem,
} from '../../store/slices/gamificationSlice';
import { syncUserStats } from '../../store/slices/authSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { StaggerContainer, StaggerItem } from '../../common/motion/StaggerList';
import { triggerDopamineConfetti } from '../../common/motion/confetti';
import { springConfig } from '../../common/motion/motion-skills';

export const ShopPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { catalog, leaderboard, previewTheme, actionLoading } = useAppSelector(
    (state) => state.gamification,
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const projects = useAppSelector((state) => state.projects.projects);

  const [activeTab, setActiveTab] = useState<'themes' | 'medals' | 'cosmetics' | 'leaderboard'>('themes');
  const [leaderboardProjectId, setLeaderboardProjectId] = useState<string>('');

  useEffect(() => {
    dispatch(fetchCatalog());
    dispatch(fetchProjects());
    dispatch(fetchLeaderboard(undefined));
  }, [dispatch]);

  const handleLeaderboardFilter = (projId: string) => {
    setLeaderboardProjectId(projId);
    dispatch(fetchLeaderboard(projId || undefined));
  };

  // Filter items by category
  const themesList = useMemo(
    () => catalog.filter((i) => i.type === 'THEME'),
    [catalog],
  );
  const medalsList = useMemo(
    () => catalog.filter((i) => i.type === 'MEDAL'),
    [catalog],
  );
  const cosmeticsList = useMemo(
    () => catalog.filter((i) => i.type === 'AVATAR_FRAME' || i.type === 'TITLE'),
    [catalog],
  );

  const handleBuy = async (item: CatalogItem) => {
    if (!item.canAfford && (currentUser?.coins ?? 0) < item.costCoins) return;

    const res = await dispatch(buyItem(item.id));
    if (buyItem.fulfilled.match(res)) {
      triggerDopamineConfetti();
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
    if (item.type === 'THEME' || item.type === 'MEDAL') {
      const res = await dispatch(
        equipItem({ itemId: item.id, type: item.type }),
      );
      if (equipItem.fulfilled.match(res)) {
        if (item.type === 'THEME') {
          dispatch(syncUserStats({ equippedTheme: item }));
        } else if (item.type === 'MEDAL') {
          dispatch(syncUserStats({ equippedMedal: item }));
        }
        dispatch(fetchCatalog());
      }
    } else if (item.type === 'AVATAR_FRAME') {
      dispatch(equipLocalCosmetic({ item, type: 'AVATAR_FRAME' }));
      dispatch(syncUserStats({ equippedFrame: item }));
    } else if (item.type === 'TITLE') {
      dispatch(equipLocalCosmetic({ item, type: 'TITLE' }));
      dispatch(syncUserStats({ equippedTitle: item }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-gold/20 border border-ploty-gold/40 text-ploty-gold text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Tienda Gamificada, Vitrina & Salón de la Fama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personalización Extrema & Trofeos
          </h2>
          <p className="text-sm text-ploty-sage/80 max-w-xl">
            Desbloquea y equipa temas de alto impacto visual, medallas holográficas, marcos de avatar pulsantes y títulos de honor.
          </p>
        </div>

        {/* 4 Animated Tabs */}
        <div className="flex items-center gap-1.5 bg-ploty-white/10 p-1.5 rounded-2xl border border-ploty-white/10 flex-wrap">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'themes'
                ? 'bg-ploty-periwinkle text-ploty-white shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Temas</span>
          </button>

          <button
            onClick={() => setActiveTab('medals')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'medals'
                ? 'bg-ploty-gold text-ploty-charcoal shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Medallas</span>
          </button>

          <button
            onClick={() => setActiveTab('cosmetics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cosmetics'
                ? 'bg-ploty-coral text-ploty-white shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Marcos & Títulos</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-ploty-white text-ploty-charcoal shadow-sm'
                : 'text-ploty-white/70 hover:text-ploty-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking</span>
          </button>
        </div>
      </motion.div>

      {/* 1. THEMES TAB (with Live Preview mode) */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-ploty-charcoal/80 px-2">
            <span>Haz clic en "Previsualizar 👁️" para probar el tema en toda la aplicación antes de comprar.</span>
            {previewTheme && (
              <button
                onClick={() => dispatch(clearPreviewTheme())}
                className="text-ploty-coral hover:underline font-black"
              >
                Cancelar Previsualización
              </button>
            )}
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themesList.map((item) => {
              const userLevel = currentUser?.level || 1;
              const userCoins = currentUser?.coins || 0;
              const levelLocked = userLevel < item.unlockLevel;
              const cannotAfford = userCoins < item.costCoins && !item.isUnlocked;
              const isPreviewing = previewTheme?.code === item.code;

              return (
                <StaggerItem key={item.id}>
                  <BentoSpringCard
                    className={`p-6 rounded-3xl shadow-tactile border-3 flex flex-col justify-between h-full transition-all ${
                      isPreviewing
                        ? 'border-ploty-primary bg-ploty-primary/10 shadow-neon'
                        : item.isEquipped
                        ? 'border-ploty-coral bg-ploty-card'
                        : 'border-ploty-charcoal/10 bg-ploty-card'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Theme Badge */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-sage/30 text-ploty-charcoal">
                          <Palette className="w-3.5 h-3.5" />
                          TEMA
                        </span>

                        {item.isEquipped ? (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/40">
                            <Check className="w-3 h-3" /> Equipado
                          </span>
                        ) : item.isUnlocked ? (
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-primary/20 text-ploty-primary">
                            Desbloqueado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-black text-ploty-gold">
                            <Coins className="w-4 h-4" /> {item.costCoins}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-black text-base leading-snug">{item.name}</h4>
                        <p className="text-xs text-ploty-charcoal/70 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Level Requirement */}
                      {levelLocked && !item.isUnlocked && (
                        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold text-ploty-charcoal/70">
                          <Lock className="w-3.5 h-3.5 text-ploty-coral" />
                          <span>Requiere Nivel {item.unlockLevel}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Live Preview + Buy/Equip */}
                    <div className="mt-5 pt-4 border-t border-ploty-charcoal/10 space-y-2">
                      <button
                        onClick={() => dispatch(setPreviewTheme(item))}
                        className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isPreviewing
                            ? 'bg-ploty-primary text-ploty-white'
                            : 'bg-ploty-sage/30 text-ploty-charcoal hover:bg-ploty-sage/50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isPreviewing ? 'Viendo Ahora' : 'Previsualizar Tema'}</span>
                      </button>

                      {item.isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-ploty-sage/30 text-ploty-charcoal/50 font-black text-xs cursor-default"
                        >
                          En Uso
                        </button>
                      ) : item.isUnlocked ? (
                        <button
                          onClick={() => handleEquip(item)}
                          disabled={actionLoading}
                          className="w-full py-2.5 rounded-2xl bg-ploty-primary hover:opacity-90 text-ploty-white font-black text-xs shadow-tactile-sm transition-all cursor-pointer"
                        >
                          Equipar Tema
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={levelLocked || cannotAfford || actionLoading}
                          className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-tactile-sm transition-all ${
                            levelLocked || cannotAfford
                              ? 'bg-ploty-charcoal/20 text-ploty-charcoal/40 cursor-not-allowed'
                              : 'bg-ploty-gold hover:opacity-90 text-ploty-charcoal cursor-pointer'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span>Comprar ({item.costCoins})</span>
                        </button>
                      )}
                    </div>
                  </BentoSpringCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      )}

      {/* 2. MEDALS TAB (Holographic Tilt Effect) */}
      {activeTab === 'medals' && (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {medalsList.map((item) => {
            const userLevel = currentUser?.level || 1;
            const userCoins = currentUser?.coins || 0;
            const levelLocked = userLevel < item.unlockLevel;
            const cannotAfford = userCoins < item.costCoins && !item.isUnlocked;

            return (
              <StaggerItem key={item.id}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={springConfig.tactile}
                  className={`p-6 rounded-3xl shadow-tactile border-3 flex flex-col justify-between h-full bg-ploty-card text-ploty-charcoal relative overflow-hidden group ${
                    item.isEquipped
                      ? 'border-ploty-gold shadow-gold-glow'
                      : 'border-ploty-charcoal/10 hover:border-ploty-primary'
                  }`}
                >
                  {/* Holographic light sweep line on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ploty-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4">
                    {/* Medal Tier Pill */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-gold/20 text-ploty-charcoal border border-ploty-gold/40">
                        <Shield className="w-3.5 h-3.5 fill-ploty-gold" />
                        {item.metadata?.tier || 'MEDAL'}
                      </span>

                      {item.isEquipped ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/40">
                          <Check className="w-3 h-3" /> Equipada
                        </span>
                      ) : item.isUnlocked ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-primary/20 text-ploty-primary">
                          Desbloqueada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-black text-ploty-gold">
                          <Coins className="w-4 h-4" /> {item.costCoins}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ploty-gold/30 to-ploty-coral/30 flex items-center justify-center text-ploty-charcoal flex-shrink-0 shadow-sm border border-ploty-gold/40">
                        <Trophy className="w-6 h-6 text-ploty-gold" />
                      </div>
                      <div>
                        <h4 className="font-black text-base leading-snug">{item.name}</h4>
                        <p className="text-xs text-ploty-charcoal/70 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {levelLocked && !item.isUnlocked && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold text-ploty-charcoal/70">
                        <Lock className="w-3.5 h-3.5 text-ploty-coral" />
                        <span>Nivel requerido: {item.unlockLevel}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-ploty-charcoal/10">
                    {item.isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-ploty-sage/30 text-ploty-charcoal/50 font-black text-xs cursor-default"
                      >
                        Equipada en HUD
                      </button>
                    ) : item.isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-2xl bg-ploty-primary hover:opacity-90 text-ploty-white font-black text-xs shadow-tactile-sm transition-all cursor-pointer"
                      >
                        Equipar Medalla
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={levelLocked || cannotAfford || actionLoading}
                        className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-tactile-sm transition-all ${
                          levelLocked || cannotAfford
                            ? 'bg-ploty-charcoal/20 text-ploty-charcoal/40 cursor-not-allowed'
                            : 'bg-ploty-gold hover:opacity-90 text-ploty-charcoal cursor-pointer'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Desbloquear por {item.costCoins}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* 3. COSMETICS TAB: AVATAR FRAMES & TITLES */}
      {activeTab === 'cosmetics' && (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cosmeticsList.map((item) => {
            const isFrame = item.type === 'AVATAR_FRAME';
            const userLevel = currentUser?.level || 1;
            const userCoins = currentUser?.coins || 0;
            const levelLocked = userLevel < item.unlockLevel;
            const cannotAfford = userCoins < item.costCoins && !item.isUnlocked;

            return (
              <StaggerItem key={item.id}>
                <BentoSpringCard className="p-6 rounded-3xl shadow-tactile border-3 border-ploty-charcoal/10 bg-ploty-card text-ploty-charcoal flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-coral/20 text-ploty-coral border border-ploty-coral/30">
                        {isFrame ? <CircleDot className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                        {isFrame ? 'Marco de Avatar' : 'Título'}
                      </span>

                      {item.isEquipped ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-ploty-coral/20 text-ploty-coral">
                          <Check className="w-3 h-3" /> Equipado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-black text-ploty-gold">
                          <Coins className="w-4 h-4" /> {item.costCoins}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-base">{item.name}</h4>
                      <p className="text-xs text-ploty-charcoal/70 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Preview box */}
                    <div className="p-4 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 flex items-center justify-center gap-3">
                      {isFrame ? (
                        <div className="p-1 rounded-full bg-gradient-to-tr from-ploty-primary via-ploty-accent to-ploty-gold shadow-neon animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-ploty-charcoal text-ploty-white flex items-center justify-center font-black text-xs">
                            {currentUser?.username.slice(0, 2).toUpperCase() || 'PL'}
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-ploty-gold/30 text-ploty-charcoal font-black text-xs uppercase tracking-wider border border-ploty-gold">
                          {item.metadata?.badgeText || item.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-ploty-charcoal/10">
                    {item.isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-ploty-sage/30 text-ploty-charcoal/50 font-black text-xs cursor-default"
                      >
                        En Uso Actualmente
                      </button>
                    ) : item.isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item)}
                        className="w-full py-2.5 rounded-2xl bg-ploty-primary hover:opacity-90 text-ploty-white font-black text-xs shadow-tactile-sm transition-all cursor-pointer"
                      >
                        Equipar {isFrame ? 'Marco' : 'Título'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={levelLocked || cannotAfford || actionLoading}
                        className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-tactile-sm transition-all ${
                          levelLocked || cannotAfford
                            ? 'bg-ploty-charcoal/20 text-ploty-charcoal/40 cursor-not-allowed'
                            : 'bg-ploty-gold hover:opacity-90 text-ploty-charcoal cursor-pointer'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Desbloquear por {item.costCoins}</span>
                      </button>
                    )}
                  </div>
                </BentoSpringCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* 4. LEADERBOARD TAB (Global & Project Filter) */}
      {activeTab === 'leaderboard' && (
        <div className="bg-ploty-card text-ploty-charcoal rounded-3xl shadow-tactile p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ploty-charcoal/10">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-ploty-gold" />
              <div>
                <h3 className="text-xl font-black">Salón de la Fama Ploty</h3>
                <p className="text-xs text-ploty-charcoal/70">
                  Ranking oficial clasificado por experiencia acumulada y consistencia de rachas.
                </p>
              </div>
            </div>

            {/* Filter by Project */}
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-ploty-charcoal/60" />
              <select
                value={leaderboardProjectId}
                onChange={(e) => handleLeaderboardFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
              >
                <option value="">Ranking Global (Todos)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((player, idx) => {
                const rankColor =
                  idx === 0
                    ? 'bg-ploty-gold text-ploty-charcoal shadow-gold-glow'
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
                        ? 'border-2 border-ploty-primary bg-ploty-primary/10'
                        : 'border-ploty-charcoal/10 bg-ploty-sage/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm ${rankColor}`}
                      >
                        #{player.rank || idx + 1}
                      </span>

                      <div className="flex items-center gap-3">
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.username}
                            className="w-10 h-10 rounded-full object-cover border border-ploty-charcoal/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-ploty-primary/20 text-ploty-primary font-black text-sm flex items-center justify-center">
                            {player.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm">{player.username}</p>
                            {player.id === currentUser?.id && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-ploty-primary text-ploty-white">
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

                      <div className="flex items-center gap-1 text-ploty-primary text-xs font-black min-w-[80px] justify-end">
                        <Sparkles className="w-4 h-4" />
                        <span>{player.xp} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-ploty-charcoal/60">
                No hay usuarios clasificados en este filtro.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
