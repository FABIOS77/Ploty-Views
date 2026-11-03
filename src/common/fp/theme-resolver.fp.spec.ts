import { describe, it, expect } from 'vitest';
import {
  LEVEL_0_PALETTE,
  THEME_TACTILE_BENTO,
  THEME_INDIGO_OBSIDIAN,
  THEME_CYBERPUNK_NEON,
  THEME_SOLAR_GOLD,
  THEME_EMERALD_MATRIX,
  resolveThemeTokens,
  applyThemeToDocument,
} from './theme-resolver.fp';

describe('Frontend Theme Resolver (theme-resolver.fp.ts)', () => {
  it('provides the official Level 0 Tactile Bento palette tokens', () => {
    expect(LEVEL_0_PALETTE.white).toBe('#FFFFFF');
    expect(LEVEL_0_PALETTE.charcoal).toBe('#312F30');
    expect(LEVEL_0_PALETTE.primaryColor).toBe('#7477FF');
    expect(LEVEL_0_PALETTE.accentColor).toBe('#F66554');
    expect(LEVEL_0_PALETTE.goldColor).toBe('#F9CD61');
    expect(LEVEL_0_PALETTE.canvas).toBe('#C5D4CA');
    expect(LEVEL_0_PALETTE.card).toBe('#FFFFFF');
    expect(LEVEL_0_PALETTE.themeCode).toBe('THEME_DEFAULT');
  });

  it('resolves default Level 0 palette if equippedTheme is null or empty', () => {
    const defaultTokens = resolveThemeTokens(null);
    expect(defaultTokens).toEqual(LEVEL_0_PALETTE);

    const emptyTokens = resolveThemeTokens({} as any);
    expect(emptyTokens).toEqual(LEVEL_0_PALETTE);
  });

  it('resolves Free Theme 1 (Ploty Tactile Bento Sage) accurately', () => {
    const resolvedDefault = resolveThemeTokens({ code: 'THEME_DEFAULT' });
    expect(resolvedDefault).toEqual(THEME_TACTILE_BENTO);
    expect(resolvedDefault.canvas).toBe('#C5D4CA');
    expect(resolvedDefault.card).toBe('#FFFFFF');
    expect(resolvedDefault.primaryColor).toBe('#7477FF');

    const resolvedBento = resolveThemeTokens({ code: 'THEME_TACTILE_BENTO' });
    expect(resolvedBento).toEqual(THEME_TACTILE_BENTO);
  });

  it('resolves Free Theme 2 (Ploty Indigo Core Obsidian Deep) with immediate visual contrast', () => {
    const resolvedPloty = resolveThemeTokens({ code: 'THEME_DEFAULT_PLOTY' });
    expect(resolvedPloty).toEqual(THEME_INDIGO_OBSIDIAN);
    expect(resolvedPloty.canvas).toBe('#0F172A');
    expect(resolvedPloty.card).toBe('#1E293B');
    expect(resolvedPloty.primaryColor).toBe('#6366F1');
    expect(resolvedPloty.textColor).toBe('#F8FAFC');

    const resolvedIndigo = resolveThemeTokens({ code: 'THEME_INDIGO_CORE' });
    expect(resolvedIndigo).toEqual(THEME_INDIGO_OBSIDIAN);

    const resolvedClassicDark = resolveThemeTokens({ code: 'THEME_CLASSIC_DARK' });
    expect(resolvedClassicDark).toEqual(THEME_INDIGO_OBSIDIAN);
  });

  it('resolves Cyberpunk Neon Overdrive theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_CYBERPUNK_NEON' });
    expect(resolved).toEqual(THEME_CYBERPUNK_NEON);
    expect(resolved.primaryColor).toBe('#00F0FF');
    expect(resolved.accentColor).toBe('#FF007F');
    expect(resolved.canvas).toBe('#090A10');
    expect(resolved.glowEffect).toBe(true);
  });

  it('resolves Solar Flare Executive theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_SOLAR_GOLD' });
    expect(resolved).toEqual(THEME_SOLAR_GOLD);
    expect(resolved.primaryColor).toBe('#F59E0B');
    expect(resolved.accentColor).toBe('#EF4444');
    expect(resolved.canvas).toBe('#181512');
  });

  it('resolves Emerald Matrix Hacker theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_EMERALD_MATRIX' });
    expect(resolved).toEqual(THEME_EMERALD_MATRIX);
    expect(resolved.primaryColor).toBe('#10B981');
    expect(resolved.accentColor).toBe('#34D399');
    expect(resolved.canvas).toBe('#06140E');
  });

  it('resolves custom theme tokens when user equips a custom shop theme', () => {
    const customTheme = {
      code: 'THEME_CUSTOM_SYNTH',
      metadata: {
        primaryColor: '#AA00FF',
        backgroundColor: '#0A0015',
        accentColor: '#FF0055',
        glowEffect: true,
      },
    };

    const resolved = resolveThemeTokens(customTheme);
    expect(resolved.primaryColor).toBe('#AA00FF');
    expect(resolved.backgroundColor).toBe('#0A0015');
    expect(resolved.accentColor).toBe('#FF0055');
    expect(resolved.glowEffect).toBe(true);
  });

  it('safely applies tokens to document root without throwing errors', () => {
    expect(() => applyThemeToDocument(LEVEL_0_PALETTE)).not.toThrow();
    expect(document.documentElement.style.getPropertyValue('--ploty-white')).toBe('#FFFFFF');
    expect(document.documentElement.style.getPropertyValue('--ploty-sage')).toBe('#C5D4CA');
    expect(document.documentElement.style.getPropertyValue('--ploty-primary')).toBe('#7477FF');

    // Test switching to Indigo Deep
    expect(() => applyThemeToDocument(THEME_INDIGO_OBSIDIAN)).not.toThrow();
    expect(document.documentElement.style.getPropertyValue('--ploty-canvas')).toBe('#0F172A');
    expect(document.documentElement.style.getPropertyValue('--ploty-card')).toBe('#1E293B');
    expect(document.documentElement.style.getPropertyValue('--ploty-primary')).toBe('#6366F1');
  });
});
