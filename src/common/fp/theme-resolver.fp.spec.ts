import { describe, it, expect } from 'vitest';
import {
  LEVEL_0_PALETTE,
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
    expect(LEVEL_0_PALETTE.themeCode).toBe('THEME_DEFAULT_PLOTY');
  });

  it('resolves default Level 0 palette if equippedTheme is null or default', () => {
    const defaultTokens = resolveThemeTokens(null);
    expect(defaultTokens).toEqual(LEVEL_0_PALETTE);

    const plotyTokens = resolveThemeTokens({ code: 'THEME_DEFAULT_PLOTY' });
    expect(plotyTokens).toEqual(LEVEL_0_PALETTE);
  });

  it('resolves Cyberpunk Neon theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_CYBERPUNK_NEON' });
    expect(resolved).toEqual(THEME_CYBERPUNK_NEON);
    expect(resolved.primaryColor).toBe('#00F0FF');
    expect(resolved.accentColor).toBe('#FF007F');
    expect(resolved.glowEffect).toBe(true);
  });

  it('resolves Solar Gold theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_SOLAR_GOLD' });
    expect(resolved).toEqual(THEME_SOLAR_GOLD);
    expect(resolved.primaryColor).toBe('#F59E0B');
    expect(resolved.accentColor).toBe('#EF4444');
  });

  it('resolves Emerald Matrix theme accurately', () => {
    const resolved = resolveThemeTokens({ code: 'THEME_EMERALD_MATRIX' });
    expect(resolved).toEqual(THEME_EMERALD_MATRIX);
    expect(resolved.primaryColor).toBe('#10B981');
    expect(resolved.accentColor).toBe('#34D399');
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
  });
});
