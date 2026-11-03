/**
 * Pure Functional Theme Resolver for Ploty-Views
 * Manages 4 contrasting dynamic themes, live previewing, and runtime CSS variable injection.
 */

export interface ThemeTokens {
  readonly white: string;
  readonly charcoal: string;
  readonly periwinkle: string;
  readonly coral: string;
  readonly gold: string;
  readonly sage: string;
  readonly canvas: string;
  readonly card: string;
  readonly dark: string;
  readonly primaryColor: string;
  readonly backgroundColor: string;
  readonly accentColor: string;
  readonly goldColor: string;
  readonly textColor: string;
  readonly textDarkColor: string;
  readonly shadow: string;
  readonly glowEffect: boolean;
  readonly confettiColors: readonly string[];
  readonly themeCode: string;
  readonly name: string;
}

export const THEME_DEFAULT_PLOTY: Readonly<ThemeTokens> = Object.freeze({
  white: '#FFFFFF',
  charcoal: '#312F30',
  periwinkle: '#7477FF',
  coral: '#F66554',
  gold: '#F9CD61',
  sage: '#C5D4CA',
  canvas: '#C5D4CA',
  card: '#FFFFFF',
  dark: '#312F30',
  primaryColor: '#7477FF',
  backgroundColor: '#C5D4CA',
  accentColor: '#F66554',
  goldColor: '#F9CD61',
  textColor: '#312F30',
  textDarkColor: '#FFFFFF',
  shadow: '4px 4px 0px 0px #312F30',
  glowEffect: false,
  confettiColors: Object.freeze(['#7477FF', '#F66554', '#F9CD61', '#C5D4CA', '#FFFFFF']),
  themeCode: 'THEME_DEFAULT_PLOTY',
  name: 'Ploty Tactile Bento (Nivel 0)',
});

export const THEME_CYBERPUNK_NEON: Readonly<ThemeTokens> = Object.freeze({
  white: '#FFFFFF',
  charcoal: '#05060A',
  periwinkle: '#00F0FF',
  coral: '#FF007F',
  gold: '#FCEE09',
  sage: '#121526',
  canvas: '#090A10',
  card: '#121526',
  dark: '#05060A',
  primaryColor: '#00F0FF',
  backgroundColor: '#090A10',
  accentColor: '#FF007F',
  goldColor: '#FCEE09',
  textColor: '#E2E8F0',
  textDarkColor: '#FFFFFF',
  shadow: '0 0 18px rgba(0, 240, 255, 0.45)',
  glowEffect: true,
  confettiColors: Object.freeze(['#00F0FF', '#FF007F', '#FCEE09', '#7928CA', '#FFFFFF']),
  themeCode: 'THEME_CYBERPUNK_NEON',
  name: 'Cyberpunk Neon Overdrive',
});

export const THEME_SOLAR_GOLD: Readonly<ThemeTokens> = Object.freeze({
  white: '#FFFFFF',
  charcoal: '#0E0C0A',
  periwinkle: '#F59E0B',
  coral: '#EF4444',
  gold: '#FDE047',
  sage: '#241F1A',
  canvas: '#181512',
  card: '#241F1A',
  dark: '#0E0C0A',
  primaryColor: '#F59E0B',
  backgroundColor: '#181512',
  accentColor: '#EF4444',
  goldColor: '#FDE047',
  textColor: '#FEF3C7',
  textDarkColor: '#FFFFFF',
  shadow: '4px 4px 0px 0px #F59E0B',
  glowEffect: true,
  confettiColors: Object.freeze(['#F59E0B', '#EF4444', '#FDE047', '#D97706', '#FFFFFF']),
  themeCode: 'THEME_SOLAR_GOLD',
  name: 'Solar Flare Executive',
});

export const THEME_EMERALD_MATRIX: Readonly<ThemeTokens> = Object.freeze({
  white: '#FFFFFF',
  charcoal: '#030A07',
  periwinkle: '#10B981',
  coral: '#34D399',
  gold: '#A7F3D0',
  sage: '#0D261B',
  canvas: '#06140E',
  card: '#0D261B',
  dark: '#030A07',
  primaryColor: '#10B981',
  backgroundColor: '#06140E',
  accentColor: '#34D399',
  goldColor: '#A7F3D0',
  textColor: '#D1FAE5',
  textDarkColor: '#FFFFFF',
  shadow: '0 0 15px rgba(16, 185, 129, 0.5)',
  glowEffect: true,
  confettiColors: Object.freeze(['#10B981', '#34D399', '#A7F3D0', '#059669', '#FFFFFF']),
  themeCode: 'THEME_EMERALD_MATRIX',
  name: 'Emerald Matrix Hacker',
});

export const THEME_CATALOG_REGISTRY: Record<string, Readonly<ThemeTokens>> = {
  THEME_DEFAULT_PLOTY,
  THEME_DEFAULT: THEME_DEFAULT_PLOTY,
  THEME_CYBERPUNK_NEON,
  THEME_SOLAR_GOLD,
  THEME_EMERALD_MATRIX,
};

export const LEVEL_0_PALETTE = THEME_DEFAULT_PLOTY;

/**
 * Pure function to resolve active theme tokens from user's equipped theme object or code
 */
export const resolveThemeTokens = (
  equippedTheme?: {
    code?: string;
    metadata?: any;
  } | null,
): Readonly<ThemeTokens> => {
  if (!equippedTheme || !equippedTheme.code) {
    return LEVEL_0_PALETTE;
  }

  const registered = THEME_CATALOG_REGISTRY[equippedTheme.code];
  if (registered) {
    return registered;
  }

  const meta = equippedTheme.metadata || {};

  return Object.freeze({
    ...LEVEL_0_PALETTE,
    primaryColor: meta.primaryColor || LEVEL_0_PALETTE.primaryColor,
    backgroundColor: meta.backgroundColor || LEVEL_0_PALETTE.backgroundColor,
    accentColor: meta.accentColor || LEVEL_0_PALETTE.accentColor,
    goldColor: meta.goldColor || LEVEL_0_PALETTE.goldColor,
    canvas: meta.backgroundColor || LEVEL_0_PALETTE.canvas,
    card: meta.cardColor || LEVEL_0_PALETTE.card,
    dark: meta.darkColor || LEVEL_0_PALETTE.dark,
    shadow: meta.shadow || LEVEL_0_PALETTE.shadow,
    glowEffect: Boolean(meta.glowEffect),
    themeCode: equippedTheme.code,
    name: equippedTheme.code,
  });
};

/**
 * Helper to apply tokens to HTML root element
 */
export const applyThemeToDocument = (tokens: ThemeTokens) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--ploty-white', tokens.white);
  root.style.setProperty('--ploty-charcoal', tokens.charcoal);
  root.style.setProperty('--ploty-periwinkle', tokens.primaryColor);
  root.style.setProperty('--ploty-coral', tokens.accentColor);
  root.style.setProperty('--ploty-gold', tokens.goldColor);
  root.style.setProperty('--ploty-sage', tokens.canvas);
  root.style.setProperty('--ploty-canvas', tokens.canvas);
  root.style.setProperty('--ploty-card', tokens.card);
  root.style.setProperty('--ploty-dark', tokens.dark);
  root.style.setProperty('--ploty-primary', tokens.primaryColor);
  root.style.setProperty('--ploty-accent', tokens.accentColor);
  root.style.setProperty('--ploty-text', tokens.textColor);
  root.style.setProperty('--ploty-shadow', tokens.shadow);
};
