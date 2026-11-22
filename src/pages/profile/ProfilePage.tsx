import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Flame,
  Coins,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Palette,
  Frame,
  Award,
  Crown,
  Save,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearAuthError,
  fetchUserProfile,
  updateProfile,
} from '../../store/slices/authSlice';
import {
  equipItem,
  fetchCatalog,
  type CatalogItem,
} from '../../store/slices/gamificationSlice';
import { isErr } from '../../common/fp/fp-core';
import {
  validateProfileForm,
  type FieldErrors,
} from '../../common/fp/form-validators.fp';
import {
  applyThemeToDocument,
  resolveThemeTokens,
} from '../../common/fp/theme-resolver.fp';
import {
  springConfig,
  staggerContainerVariants,
  staggerItemVariants,
} from '../../common/motion/motion-skills';

const BentoSpringCard: React.FC<{
  readonly className?: string;
  readonly children: React.ReactNode;
}> = ({ className = '', children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={springConfig.tactile}
    className={className}
  >
    {children}
  </motion.div>
);

type WardrobeCategoryKey = 'THEME' | 'AVATAR_FRAME' | 'TITLE' | 'MEDAL';

interface WardrobeGroup {
  readonly key: WardrobeCategoryKey;
  readonly label: string;
  readonly subtitle: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly items: readonly CatalogItem[];
}

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading, error: authError } = useAppSelector(
    (state) => state.auth,
  );
  const {
    catalog,
    equippedTheme,
    equippedFrame,
    equippedTitle,
    equippedMedal,
    loading: catalogLoading,
  } = useAppSelector((state) => state.gamification);

  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [heroAvatarBroken, setHeroAvatarBroken] = useState(false);
  const [previewAvatarBroken, setPreviewAvatarBroken] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null,
  );
  const [equippingId, setEquippingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user?.id, user?.username, user?.avatarUrl]);

  useEffect(() => {
    setHeroAvatarBroken(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    setPreviewAvatarBroken(false);
  }, [avatarUrl]);

  const activeFrame = useMemo(
    () =>
      user?.equippedFrame ||
      equippedFrame ||
      (user?.equippedFrameId
        ? catalog.find((i) => i.id === user.equippedFrameId) || {
            id: user.equippedFrameId,
            code: 'EQUIPPED_FRAME',
            name: 'Marco Equipado',
          }
        : null),
    [user?.equippedFrame, user?.equippedFrameId, equippedFrame, catalog],
  );

  const activeTitle = useMemo(
    () =>
      user?.equippedTitle ||
      equippedTitle ||
      (user?.equippedTitleId
        ? catalog.find((i) => i.id === user.equippedTitleId) || null
        : null),
    [user?.equippedTitle, user?.equippedTitleId, equippedTitle, catalog],
  );

  const activeMedal = useMemo(
    () =>
      user?.equippedMedal ||
      equippedMedal ||
      (user?.equippedMedalId
        ? catalog.find((i) => i.id === user.equippedMedalId) || null
        : null),
    [user?.equippedMedal, user?.equippedMedalId, equippedMedal, catalog],
  );

  const activeTheme = useMemo(
    () =>
      user?.equippedTheme ||
      equippedTheme ||
      (user?.equippedThemeId
        ? catalog.find((i) => i.id === user.equippedThemeId) || null
        : null),
    [user?.equippedTheme, user?.equippedThemeId, equippedTheme, catalog],
  );

  const unlockedCatalog = useMemo(
    () => catalog.filter((item) => item.isUnlocked),
    [catalog],
  );

  const wardrobeGroups: readonly WardrobeGroup[] = useMemo(
    () => [
      {
        key: 'THEME',
        label: 'Temas',
        subtitle: 'Paletas dinámicas Tactile Bento',
        icon: Palette,
        items: unlockedCatalog.filter((i) => i.type === 'THEME'),
      },
      {
        key: 'AVATAR_FRAME',
        label: 'Marcos',
        subtitle: 'Auras y anillos para tu avatar',
        icon: Frame,
        items: unlockedCatalog.filter(
          (i) => i.type === 'AVATAR_FRAME' || i.type === 'FRAME',
        ),
      },
      {
        key: 'TITLE',
        label: 'Títulos',
        subtitle: 'Rangos honoríficos bajo tu nombre',
        icon: Crown,
        items: unlockedCatalog.filter((i) => i.type === 'TITLE'),
      },
      {
        key: 'MEDAL',
        label: 'Medallas',
        subtitle: 'Insignias de logro exhibidas en el HUD',
        icon: Award,
        items: unlockedCatalog.filter((i) => i.type === 'MEDAL'),
      },
    ],
    [unlockedCatalog],
  );

  if (!user) {
    return null;
  }

  const level = user.level || 1;
  const xp = user.xp || 0;
  const nextLevelXp = user.nextLevelXp || 100 * Math.pow(level, 2);
  const currentLevelBaseXp =
    user.currentLevelBaseXp ?? (level > 1 ? 100 * Math.pow(level - 1, 2) : 0);
  const progressPercent =
    user.progressToNextLevelPercent ??
    user.progressPercent ??
    (nextLevelXp > currentLevelBaseXp
      ? Math.round(
          Math.min(
            Math.max(
              (xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp),
              0,
            ),
            1,
          ) * 100,
        )
      : 0);

  const heroInitials = (user.username || 'PL').trim().slice(0, 2).toUpperCase();
  const previewInitials = (username || user.username || 'PL')
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const trimmedPreviewUrl = avatarUrl.trim();
  const showHeroImage = Boolean(user.avatarUrl) && !heroAvatarBroken;
  const showPreviewImage =
    trimmedPreviewUrl.startsWith('https://') && !previewAvatarBroken;

  const isItemCurrentlyEquipped = (item: CatalogItem): boolean => {
    if (item.isEquipped) return true;
    if (item.type === 'THEME') {
      return activeTheme?.id === item.id || user.equippedThemeId === item.id;
    }
    if (item.type === 'AVATAR_FRAME' || item.type === 'FRAME') {
      return activeFrame?.id === item.id || user.equippedFrameId === item.id;
    }
    if (item.type === 'TITLE') {
      return activeTitle?.id === item.id || user.equippedTitleId === item.id;
    }
    if (item.type === 'MEDAL') {
      return activeMedal?.id === item.id || user.equippedMedalId === item.id;
    }
    return false;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMessage(null);
    dispatch(clearAuthError());

    const validation = validateProfileForm({ username, avatarUrl });
    if (isErr(validation)) {
      setFieldErrors(validation.error);
      return;
    }

    setFieldErrors({});
    const resultAction = await dispatch(updateProfile(validation.value));
    if (updateProfile.fulfilled.match(resultAction)) {
      setSaveSuccessMessage('Perfil actualizado');
      dispatch(fetchUserProfile());
    }
  };

  const handleResetForm = () => {
    setUsername(user.username || '');
    setAvatarUrl(user.avatarUrl || '');
    setFieldErrors({});
    setSaveSuccessMessage(null);
    dispatch(clearAuthError());
  };

  const handleEquipCosmetic = async (item: CatalogItem) => {
    if (isItemCurrentlyEquipped(item)) return;
    setEquippingId(item.id);
    try {
      const normalizedType =
        item.type === 'FRAME'
          ? 'AVATAR_FRAME'
          : (item.type as 'THEME' | 'MEDAL' | 'AVATAR_FRAME' | 'TITLE');
      const resultAction = await dispatch(
        equipItem({ itemId: item.id, type: normalizedType }),
      );
      if (equipItem.fulfilled.match(resultAction)) {
        if (item.type === 'THEME') {
          const tokens = resolveThemeTokens(item);
          applyThemeToDocument(tokens);
        }
        dispatch(fetchUserProfile());
      }
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Page Header */}
      <motion.div
        variants={staggerItemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ploty-periwinkle/15 text-ploty-periwinkle text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identidad & Armario Gamificado</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-ploty-charcoal">
            Mi Perfil de Jugador
          </h1>
          <p className="text-sm font-semibold text-ploty-charcoal/70 mt-1">
            Personaliza tu identidad pública, previsualiza tu avatar y equipa tus
            cosméticos desbloqueados al instante.
          </p>
        </div>
      </motion.div>

      {/* SECTION 1: Tarjeta Hero del Jugador */}
      <motion.div variants={staggerItemVariants}>
        <BentoSpringCard className="p-6 sm:p-8 bg-ploty-card border-2 border-ploty-charcoal rounded-3xl shadow-tactile">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Avatar + Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-start sm:self-center">
                {activeFrame ? (
                  <div
                    className="p-1.5 rounded-full bg-gradient-to-tr from-[#7477FF] via-[#F66554] to-[#F9CD61] shadow-[0_0_20px_rgba(116,119,255,0.45)] ring-4 ring-[#F9CD61]/50"
                    title={`Marco equipado: ${activeFrame.name}`}
                  >
                    {showHeroImage ? (
                      <img
                        src={user.avatarUrl!}
                        alt={user.username}
                        onError={() => setHeroAvatarBroken(true)}
                        className="w-24 h-24 rounded-full object-cover bg-ploty-charcoal block"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-ploty-periwinkle flex items-center justify-center text-white font-black text-3xl select-none">
                        {heroInitials}
                      </div>
                    )}
                  </div>
                ) : showHeroImage ? (
                  <img
                    src={user.avatarUrl!}
                    alt={user.username}
                    onError={() => setHeroAvatarBroken(true)}
                    className="w-24 h-24 rounded-full object-cover border-4 border-ploty-periwinkle bg-ploty-charcoal block"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-ploty-periwinkle border-4 border-ploty-charcoal flex items-center justify-center text-white font-black text-3xl select-none">
                    {heroInitials}
                  </div>
                )}

                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-xl bg-ploty-charcoal text-ploty-white font-black text-xs border-2 border-ploty-white shadow-sm">
                  L{level}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-ploty-charcoal">
                    {user.username}
                  </h2>
                  {activeTitle && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-ploty-gold/25 border-2 border-ploty-gold text-ploty-charcoal text-xs font-black uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-ploty-charcoal" />
                      {activeTitle.name}
                    </span>
                  )}
                  {activeMedal && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-ploty-periwinkle/15 border-2 border-ploty-periwinkle text-ploty-periwinkle text-xs font-black">
                      <Shield className="w-3.5 h-3.5" />
                      {activeMedal.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-ploty-charcoal/70">
                  <Mail className="w-4 h-4 text-ploty-periwinkle" />
                  <span>{user.email}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-extrabold text-ploty-charcoal/80">
                  <span className="px-2.5 py-1 rounded-lg bg-ploty-sage/50 border border-ploty-charcoal/20">
                    Marco: <strong>{activeFrame?.name || 'Estándar'}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-ploty-sage/50 border border-ploty-charcoal/20">
                    Tema: <strong>{activeTheme?.name || 'Ploty Tactile Bento'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Bento Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:min-w-[410px]">
              {/* XP Progress Card */}
              <div className="p-4 rounded-2xl bg-ploty-sage/40 border-2 border-ploty-charcoal/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-black uppercase text-ploty-charcoal/70">
                  <span>Nivel {level}</span>
                  <span className="text-ploty-periwinkle">{progressPercent}%</span>
                </div>
                <div className="my-2 text-lg font-black text-ploty-charcoal">
                  {xp} <span className="text-xs font-bold opacity-70">/ {nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-ploty-charcoal/15 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ploty-periwinkle to-ploty-coral rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Coins Card */}
              <div className="p-4 rounded-2xl bg-ploty-gold/20 border-2 border-ploty-gold flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-black uppercase text-ploty-charcoal/80">
                  <span>Monedas</span>
                  <Coins className="w-4 h-4 text-ploty-charcoal" />
                </div>
                <div className="text-2xl font-black text-ploty-charcoal mt-1">
                  {user.coins || 0}
                </div>
                <span className="text-[11px] font-bold text-ploty-charcoal/70">
                  Disponibles en tienda
                </span>
              </div>

              {/* Streak Card */}
              <div className="p-4 rounded-2xl bg-ploty-coral/15 border-2 border-ploty-coral flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-black uppercase text-ploty-charcoal/80">
                  <span>Racha Activa</span>
                  <Flame className="w-4 h-4 text-ploty-coral fill-ploty-coral" />
                </div>
                <div className="text-2xl font-black text-ploty-charcoal mt-1">
                  {user.currentStreak || 0} días
                </div>
                <span className="text-[11px] font-bold text-ploty-charcoal/70">
                  Récord: {user.longestStreak || user.currentStreak || 0} días
                </span>
              </div>
            </div>
          </div>
        </BentoSpringCard>
      </motion.div>

      {/* SECTION 2: Editar Perfil + Vista Previa en Tiempo Real */}
      <motion.div variants={staggerItemVariants}>
        <BentoSpringCard className="p-6 sm:p-8 bg-ploty-card border-2 border-ploty-charcoal rounded-3xl shadow-tactile">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-ploty-periwinkle text-white flex items-center justify-center font-black shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ploty-charcoal">
                Editar Perfil
              </h2>
              <p className="text-xs font-bold text-ploty-charcoal/70">
                Actualiza tu nombre de usuario y la URL HTTPS de tu avatar con
                previsualización instantánea.
              </p>
            </div>
          </div>

          {saveSuccessMessage && (
            <div
              role="status"
              className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-600 text-ploty-charcoal flex items-center gap-3 font-black text-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-2xl bg-ploty-coral/15 border-2 border-ploty-coral text-ploty-charcoal flex items-center gap-3 font-black text-sm"
            >
              <AlertCircle className="w-5 h-5 text-ploty-coral shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <form
              onSubmit={handleProfileSubmit}
              className="lg:col-span-2 space-y-5"
              noValidate
            >
              {/* Username Field */}
              <div>
                <label
                  htmlFor="profile-username"
                  className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-2"
                >
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ploty-charcoal/60 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSaveSuccessMessage(null);
                    }}
                    placeholder="ej. fabio_hero"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-ploty-sage/30 border-2 border-ploty-charcoal text-ploty-charcoal font-bold text-sm focus:outline-none focus:border-ploty-periwinkle"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1.5 text-xs font-black text-ploty-coral">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Avatar URL Field */}
              <div>
                <label
                  htmlFor="profile-avatar-url"
                  className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-2"
                >
                  URL del Avatar (HTTPS opcional)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-ploty-charcoal/60 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-avatar-url"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setSaveSuccessMessage(null);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-ploty-sage/30 border-2 border-ploty-charcoal text-ploty-charcoal font-bold text-sm focus:outline-none focus:border-ploty-periwinkle"
                  />
                </div>
                <p className="mt-1 text-[11px] font-semibold text-ploty-charcoal/65">
                  Déjalo vacío para usar tus iniciales con el color de tu perfil.
                </p>
                {fieldErrors.avatarUrl && (
                  <p className="mt-1.5 text-xs font-black text-ploty-coral">
                    {fieldErrors.avatarUrl}
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springConfig.tactile}
                  type="submit"
                  disabled={authLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-ploty-periwinkle text-white font-black text-sm border-2 border-ploty-charcoal shadow-tactile-sm cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{authLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-ploty-sage/40 hover:bg-ploty-sage/70 text-ploty-charcoal font-bold text-sm border-2 border-ploty-charcoal/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restablecer</span>
                </button>
              </div>
            </form>

            {/* Real-time Avatar Preview Card */}
            <div className="p-5 rounded-2xl bg-ploty-sage/35 border-2 border-ploty-charcoal/30 flex flex-col items-center text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-ploty-charcoal/70 mb-3">
                Vista Previa en Tiempo Real
              </span>

              <div className="relative mb-3">
                {activeFrame ? (
                  <div className="p-1 rounded-full bg-gradient-to-tr from-[#7477FF] via-[#F66554] to-[#F9CD61] shadow-md">
                    {showPreviewImage ? (
                      <img
                        src={trimmedPreviewUrl}
                        alt="Vista previa de avatar"
                        onError={() => setPreviewAvatarBroken(true)}
                        className="w-20 h-20 rounded-full object-cover bg-ploty-charcoal block"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-ploty-periwinkle flex items-center justify-center text-white font-black text-2xl select-none">
                        {previewInitials}
                      </div>
                    )}
                  </div>
                ) : showPreviewImage ? (
                  <img
                    src={trimmedPreviewUrl}
                    alt="Vista previa de avatar"
                    onError={() => setPreviewAvatarBroken(true)}
                    className="w-20 h-20 rounded-full object-cover border-2 border-ploty-periwinkle bg-ploty-charcoal block"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-ploty-periwinkle border-2 border-ploty-charcoal flex items-center justify-center text-white font-black text-2xl select-none">
                    {previewInitials}
                  </div>
                )}
              </div>

              <span className="font-black text-base text-ploty-charcoal truncate max-w-full">
                {username.trim() || user.username}
              </span>
              <span className="text-xs font-bold text-ploty-periwinkle mt-0.5">
                {activeTitle ? activeTitle.name : `Jugador Nivel ${level}`}
              </span>

              {trimmedPreviewUrl.length > 0 && previewAvatarBroken && (
                <p className="mt-2 text-[11px] font-black text-ploty-coral">
                  No se pudo cargar la imagen de esta URL. Se mostrarán tus
                  iniciales como respaldo.
                </p>
              )}
            </div>
          </div>
        </BentoSpringCard>
      </motion.div>

      {/* SECTION 3: Armario Rápido (Cosméticos Desbloqueados) */}
      <motion.div variants={staggerItemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-ploty-charcoal">
              Armario Rápido (Cosméticos Desbloqueados)
            </h2>
            <p className="text-xs font-bold text-ploty-charcoal/70">
              Equipa directamente tus temas, marcos, títulos y medallas
              adquiridos sin salir de tu perfil.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-ploty-card border-2 border-ploty-charcoal text-xs font-black text-ploty-charcoal self-start sm:self-center">
            {unlockedCatalog.length} cosméticos en tu inventario
          </span>
        </div>

        {catalogLoading && unlockedCatalog.length === 0 ? (
          <div className="p-8 rounded-3xl bg-ploty-card border-2 border-ploty-charcoal text-center font-bold text-sm text-ploty-charcoal/70">
            Cargando tu armario de cosméticos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wardrobeGroups.map((group) => {
              const IconComponent = group.icon;
              return (
                <BentoSpringCard
                  key={group.key}
                  className="p-6 bg-ploty-card border-2 border-ploty-charcoal rounded-3xl shadow-tactile flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-ploty-periwinkle/15 border-2 border-ploty-periwinkle text-ploty-periwinkle flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-ploty-charcoal leading-tight">
                            {group.label}
                          </h3>
                          <p className="text-xs font-semibold text-ploty-charcoal/65">
                            {group.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-ploty-sage/50 text-xs font-black text-ploty-charcoal">
                        {group.items.length}
                      </span>
                    </div>

                    {group.items.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-ploty-sage/25 border border-dashed border-ploty-charcoal/30 text-xs font-bold text-ploty-charcoal/65 text-center">
                        Aún no tienes cosméticos desbloqueados en esta categoría.
                        Visita la tienda de Recompensas para desbloquearlos.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {group.items.map((item) => {
                          const equipped = isItemCurrentlyEquipped(item);
                          const isBusy = equippingId === item.id;
                          return (
                            <div
                              key={item.id}
                              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                                equipped
                                  ? 'bg-ploty-periwinkle/15 border-ploty-periwinkle'
                                  : 'bg-ploty-sage/25 border-ploty-charcoal/20 hover:border-ploty-charcoal/50'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm text-ploty-charcoal truncate">
                                    {item.name}
                                  </span>
                                  {equipped && (
                                    <span className="px-2 py-0.5 rounded-md bg-ploty-periwinkle text-white text-[10px] font-black uppercase">
                                      Activo
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs font-semibold text-ploty-charcoal/70 truncate mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={equipped || isBusy}
                                onClick={() => handleEquipCosmetic(item)}
                                className={`shrink-0 px-3.5 py-2 rounded-xl font-black text-xs border-2 transition-all ${
                                  equipped
                                    ? 'bg-emerald-500/20 border-emerald-600 text-ploty-charcoal cursor-default'
                                    : 'bg-ploty-periwinkle hover:opacity-95 text-white border-ploty-charcoal shadow-tactile-sm cursor-pointer'
                                }`}
                              >
                                {equipped
                                  ? 'Equipado'
                                  : isBusy
                                    ? 'Equipando...'
                                    : 'Equipar'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </BentoSpringCard>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
