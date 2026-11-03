import { describe, it, expect } from 'vitest';
import {
  LEVEL_0_PALETTE,
  resolveThemeTokens,
  applyThemeToDocument,
} from './theme-resolver.fp';

describe('Frontend Theme Resolver (theme-resolver.fp.ts)', () => {
  it('provides the official Level 0 Tactile Bento palette tokens', () => {
    expect(LEVEL_0_PALETTE.white).toBe('#FFFFFF');
    expect(LEVEL_0_PALETTE.charcoal).toBe('#312F30');
    expect(LEVEL_0_PALETTE.periwinkle).toBe('#7477FF');
    expect(LEVEL_0_PALETTE.coral).toBe('#F66554');
    expect(LEVEL_0_PALETTE.gold).toBe('#F9CD61');
    expect(LEVEL_0_PALETTE.sage).toBe('#C5D4CA');
    expect(LEVEL_0_PALETTE.themeCode).toBe('THEME_DEFAULT_PLOTY');
  });

  it('resolves default Level 0 palette if equippedTheme is null or default', () => {
    const defaultTokens = resolveThemeTokens(null);
    expect(defaultTokens).toEqual(LEVEL_0_PALETTE);

    const plotyTokens = resolveThemeTokens({ code: 'THEME_DEFAULT_PLOTY' });
    expect(plotyTokens).toEqual(LEVEL_0_PALETTE);
  });

  it('resolves custom theme tokens when user equips a shop theme', () => {
    const customTheme = {
      code: 'THEME_CYBER_NEON',
      metadata: {
        primaryColor: '#00FFAA',
        backgroundColor: '#111122',
        accentColor: '#FF0055',
        glowEffect: true,
      },
    };

    const resolved = resolveThemeTokens(customTheme);
    expect(resolved.primaryColor).toBe('#00FFAA');
    expect(resolved.backgroundColor).toBe('#111122');
    expect(resolved.accentColor).toBe('#FF0055');
    expect(resolved.glowEffect).toBe(true);
    expect(resolved.themeCode).toBe('THEME_CYBER_NEON');
    // base charcoal/white remain intact
    expect(resolved.white).toBe('#FFFFFF');
    expect(resolved.charcoal).toBe('#312F30');
  });

  it('safely applies tokens to document root without throwing errors', () => {
    expect(() => applyThemeToDocument(LEVEL_0_PALETTE)).not.toThrow();
    expect(document.documentElement.style.getPropertyValue('--ploty-white')).toBe('#FFFFFF');
    expect(document.documentElement.style.getPropertyValue('--ploty-sage')).toBe('#C5D4CA');
  });
});
