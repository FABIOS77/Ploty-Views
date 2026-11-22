import { describe, it, expect } from 'vitest';
import { isErr, isOk } from './fp-core';
import {
  evaluatePasswordStrength,
  validateActivityForm,
  validateLoginForm,
  validateProfileForm,
  validateProjectForm,
  validateRegisterForm,
} from './form-validators.fp';

describe('Pure Functional Form Validators (form-validators.fp.ts)', () => {
  describe('evaluatePasswordStrength', () => {
    it('rates short/simple passwords as weak', () => {
      const res = evaluatePasswordStrength('1234');
      expect(res.level).toBe('weak');
      expect(res.score).toBeLessThan(45);
    });

    it('rates 8+ char mixed alphanumeric passwords as medium', () => {
      const res = evaluatePasswordStrength('ploty123');
      expect(res.level).toBe('medium');
      expect(res.score).toBeGreaterThanOrEqual(45);
    });

    it('rates 8+ char passwords with upper, lower, digit and symbol as strong', () => {
      const res = evaluatePasswordStrength('Demo1234!Ploty');
      expect(res.level).toBe('strong');
      expect(res.score).toBeGreaterThanOrEqual(75);
    });
  });

  describe('validateLoginForm', () => {
    it('accepts valid email and non-empty password', () => {
      const res = validateLoginForm({
        email: '  demo@ploty.app  ',
        password: 'Demo1234!',
      });
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value.email).toBe('demo@ploty.app');
      }
    });

    it('rejects invalid email and empty password', () => {
      const res = validateLoginForm({ email: 'not-an-email', password: '' });
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error.email).toBeDefined();
        expect(res.error.password).toBeDefined();
      }
    });
  });

  describe('validateRegisterForm', () => {
    it('accepts valid registration data including optional https avatarUrl', () => {
      const res = validateRegisterForm({
        username: 'fabio_demo',
        email: 'demo@ploty.app',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        avatarUrl: 'https://images.unsplash.com/avatar.png',
      });
      expect(isOk(res)).toBe(true);
    });

    it('rejects username with spaces, short password, mismatched confirmation, and http avatarUrl', () => {
      const res = validateRegisterForm({
        username: 'invalid user',
        email: 'bad-email',
        password: 'short',
        confirmPassword: 'different',
        avatarUrl: 'http://insecure.example.com/pic.png',
      });
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error.username).toBeDefined();
        expect(res.error.email).toBeDefined();
        expect(res.error.password).toBeDefined();
        expect(res.error.confirmPassword).toBeDefined();
        expect(res.error.avatarUrl).toBeDefined();
      }
    });
  });

  describe('validateActivityForm', () => {
    it('validates title length, recurrence interval, and reward ranges', () => {
      const badRes = validateActivityForm({
        title: 'Hi',
        type: 'RECURRING',
        recurrenceInterval: 400,
        priority: 'HIGH',
        xpReward: 999,
        coinReward: 500,
      });
      expect(isErr(badRes)).toBe(true);
      if (isErr(badRes)) {
        expect(badRes.error.title).toBeDefined();
        expect(badRes.error.recurrenceInterval).toBeDefined();
        expect(badRes.error.xpReward).toBeDefined();
        expect(badRes.error.coinReward).toBeDefined();
      }
    });

    it('returns a non-blocking warning when dueDate is in the past', () => {
      const refDate = new Date('2026-11-21T12:00:00.000Z');
      const res = validateActivityForm(
        {
          title: 'Revisar arquitectura FP',
          type: 'SINGLE',
          priority: 'MEDIUM',
          dueDate: '2026-11-10',
        },
        refDate,
      );
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value.warnings.length).toBe(1);
      }
    });
  });

  describe('validateProjectForm', () => {
    it('accepts valid project name and description', () => {
      const res = validateProjectForm({
        name: 'Meta Personal FP',
        description: 'Dominar programación funcional pura',
      });
      expect(isOk(res)).toBe(true);
    });

    it('rejects name < 3 chars and description > 500 chars', () => {
      const res = validateProjectForm({
        name: 'AB',
        description: 'x'.repeat(501),
      });
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error.name).toBeDefined();
        expect(res.error.description).toBeDefined();
      }
    });
  });

  describe('validateProfileForm', () => {
    it('accepts valid username and valid https avatarUrl', () => {
      const res = validateProfileForm({
        username: '  fabio_hero_99 ',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      });
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value.username).toBe('fabio_hero_99');
        expect(res.value.avatarUrl).toBe(
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        );
      }
    });

    it('normalizes empty or null avatarUrl to null', () => {
      const resEmpty = validateProfileForm({
        username: 'ploty_player',
        avatarUrl: '   ',
      });
      expect(isOk(resEmpty)).toBe(true);
      if (isOk(resEmpty)) {
        expect(resEmpty.value.avatarUrl).toBeNull();
      }

      const resNull = validateProfileForm({
        username: 'ploty_player',
        avatarUrl: null,
      });
      expect(isOk(resNull)).toBe(true);
      if (isOk(resNull)) {
        expect(resNull.value.avatarUrl).toBeNull();
      }
    });

    it('rejects invalid username and non-https avatarUrl', () => {
      const res = validateProfileForm({
        username: 'ab',
        avatarUrl: 'http://insecure.com/avatar.png',
      });
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error.username).toBeDefined();
        expect(res.error.avatarUrl).toBeDefined();
      }
    });
  });
});
