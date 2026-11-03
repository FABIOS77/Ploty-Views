/**
 * Pure Functional Theme Resolver for Ploty-Views
 * Resolves active CSS tokens, strictly guaranteeing the Level 0 Tactile Bento palette.
 */

export interface ThemeTokens {
  readonly white: string;
  readonly charcoal: string;
  readonly periwinkle: string;
  readonly coral: string;
  readonly gold: string;
  readonly sage: string;
  readonly primaryColor: string;
  readonly backgroundColor: string;
  readonly accentColor: string;
  readonly glowEffect: boolean;
  readonly themeCode: string;
}

export const LEVEL_0_PALETTE: Readonly<ThemeTokens> = Object.freeze({
  white: '#FFFFFF',
  charcoal: '#312F30',
  periwinkle: '#7477FF',
  coral: '#F66554',
  gold: '#F9CD61',
  sage: '#C5D4CA',
  primaryColor: '#7477FF',
  backgroundColor: '#C5D4CA',
  accentColor: '#F66554',
  glowEffect: false,
  themeCode: 'THEME_DEFAULT_PLOTY',
});

/**
 * Pure function to resolve active theme tokens from user's equipped theme object
 */
export const resolveThemeTokens = (
  equippedTheme?: {
    code?: string;
    metadata?: any;
  } | null,
): Readonly<ThemeTokens> => {
  if (!equippedTheme || !equippedTheme.code || equippedTheme.code === 'THEME_DEFAULT_PLOTY') {
    return LEVEL_0_PALETTE;
  }

  const meta = equippedTheme.metadata || {};

  return Object.freeze({
    ...LEVEL_0_PALETTE,
    primaryColor: meta.primaryColor || LEVEL_0_PALETTE.periwinkle,
    backgroundColor: meta.backgroundColor || LEVEL_0_PALETTE.sage,
    accentColor: meta.accentColor || LEVEL_0_PALETTE.coral,
    glowEffect: Boolean(meta.glowEffect),
    themeCode: equippedTheme.code,
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
  root.style.setProperty('--ploty-coral', tokens.coral);
  root.style.setProperty('--ploty-gold', tokens.gold);
  root.style.setProperty('--ploty-sage', tokens.backgroundColor);
};
