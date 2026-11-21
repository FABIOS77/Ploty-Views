/**
 * Pure Functional Declarative Form Validators for Ploty-Views
 * Reuses Result<T, E> from fp-core.ts. Zero side effects, zero mutations.
 */

import { err, ok, type Result } from './fp-core';

export type FieldErrors = Readonly<Record<string, string>>;

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  readonly level: PasswordStrengthLevel;
  readonly score: number;
  readonly label: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const isValidHttpsUrl = (rawUrl: string): boolean => {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Pure evaluator of password strength returning weak | medium | strong + numeric score [0..100]
 */
export const evaluatePasswordStrength = (
  password: string,
): Readonly<PasswordStrengthResult> => {
  if (!password) {
    return Object.freeze({ level: 'weak', score: 0, label: 'Muy débil' });
  }

  const checks = [
    password.length >= 8 ? 25 : Math.min(15, password.length * 2),
    password.length >= 12 ? 15 : 0,
    /[a-z]/.test(password) ? 15 : 0,
    /[A-Z]/.test(password) ? 15 : 0,
    /\d/.test(password) ? 15 : 0,
    /[^a-zA-Z0-9]/.test(password) ? 15 : 0,
  ];

  const score = Math.min(
    100,
    checks.reduce((acc, v) => acc + v, 0),
  );

  if (score >= 75 && password.length >= 8) {
    return Object.freeze({ level: 'strong', score, label: 'Fuerte' });
  }
  if (score >= 45 && password.length >= 8) {
    return Object.freeze({ level: 'medium', score, label: 'Media' });
  }
  return Object.freeze({ level: 'weak', score, label: 'Débil' });
};

export interface LoginFormInput {
  readonly email: string;
  readonly password: string;
}

export interface ValidatedLoginForm {
  readonly email: string;
  readonly password: string;
}

export const validateLoginForm = (
  input: LoginFormInput,
): Result<Readonly<ValidatedLoginForm>, FieldErrors> => {
  const email = (input.email ?? '').trim();
  const password = input.password ?? '';

  const errors: Record<string, string> = {
    ...(!email
      ? { email: 'El correo electrónico es obligatorio' }
      : !EMAIL_REGEX.test(email)
        ? { email: 'Ingresa un correo electrónico válido' }
        : {}),
    ...(!password ? { password: 'La contraseña es obligatoria' } : {}),
  };

  if (Object.keys(errors).length > 0) {
    return err(Object.freeze(errors));
  }

  return ok(Object.freeze({ email, password }));
};

export interface RegisterFormInput {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly avatarUrl?: string;
}

export interface ValidatedRegisterForm {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly avatarUrl?: string;
}

export const validateRegisterForm = (
  input: RegisterFormInput,
): Result<Readonly<ValidatedRegisterForm>, FieldErrors> => {
  const username = (input.username ?? '').trim();
  const email = (input.email ?? '').trim();
  const password = input.password ?? '';
  const confirmPassword = input.confirmPassword ?? '';
  const avatarUrl = (input.avatarUrl ?? '').trim();

  const errors: Record<string, string> = {
    ...(!username
      ? { username: 'El nombre de usuario es obligatorio' }
      : !USERNAME_REGEX.test(username)
        ? {
            username:
              'Usa entre 3 y 30 caracteres (solo letras, números y guión bajo, sin espacios)',
          }
        : {}),
    ...(!email
      ? { email: 'El correo electrónico es obligatorio' }
      : !EMAIL_REGEX.test(email)
        ? { email: 'Ingresa un correo electrónico válido' }
        : {}),
    ...(password.length < 8
      ? { password: 'La contraseña debe tener al menos 8 caracteres' }
      : {}),
    ...(confirmPassword !== password
      ? { confirmPassword: 'Las contraseñas no coinciden' }
      : {}),
    ...(avatarUrl.length > 0 && !isValidHttpsUrl(avatarUrl)
      ? { avatarUrl: 'La URL del avatar debe ser válida y usar protocolo https://' }
      : {}),
  };

  if (Object.keys(errors).length > 0) {
    return err(Object.freeze(errors));
  }

  return ok(
    Object.freeze({
      username,
      email,
      password,
      avatarUrl: avatarUrl || undefined,
    }),
  );
};

export interface ActivityFormInput {
  readonly title: string;
  readonly description?: string;
  readonly type: 'SINGLE' | 'RECURRING';
  readonly recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM_DAYS';
  readonly recurrenceInterval?: number;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly dueDate?: string;
  readonly xpReward?: number;
  readonly coinReward?: number;
  readonly projectId?: string;
  readonly assigneeId?: string;
}

export interface ValidatedActivityForm extends ActivityFormInput {
  readonly warnings: readonly string[];
}

export const validateActivityForm = (
  input: ActivityFormInput,
  referenceDate: Date = new Date(),
): Result<Readonly<ValidatedActivityForm>, FieldErrors> => {
  const title = (input.title ?? '').trim();
  const description = (input.description ?? '').trim();
  const interval = input.recurrenceInterval ?? 1;

  const errors: Record<string, string> = {
    ...(title.length < 3 || title.length > 120
      ? { title: 'El título debe tener entre 3 y 120 caracteres' }
      : {}),
    ...(input.type === 'RECURRING' &&
    (!Number.isInteger(interval) || interval < 1 || interval > 365)
      ? {
          recurrenceInterval:
            'El intervalo de recurrencia debe ser un entero entre 1 y 365',
        }
      : {}),
    ...(input.xpReward !== undefined &&
    (input.xpReward < 0 || input.xpReward > 500)
      ? { xpReward: 'La recompensa XP debe estar entre 0 y 500' }
      : {}),
    ...(input.coinReward !== undefined &&
    (input.coinReward < 0 || input.coinReward > 250)
      ? { coinReward: 'La recompensa en monedas debe estar entre 0 y 250' }
      : {}),
  };

  if (Object.keys(errors).length > 0) {
    return err(Object.freeze(errors));
  }

  const warnings: string[] = [];
  if (input.dueDate) {
    const parsedDue = new Date(input.dueDate);
    const todayStart = new Date(referenceDate);
    todayStart.setHours(0, 0, 0, 0);
    if (!isNaN(parsedDue.getTime()) && parsedDue.getTime() < todayStart.getTime()) {
      warnings.push(
        'La fecha límite seleccionada está en el pasado (la tarea aparecerá como atrasada).',
      );
    }
  }

  return ok(
    Object.freeze({
      ...input,
      title,
      description: description || undefined,
      recurrenceInterval: input.type === 'RECURRING' ? interval : 1,
      warnings: Object.freeze(warnings),
    }),
  );
};

export interface ProjectFormInput {
  readonly name: string;
  readonly description?: string;
}

export interface ValidatedProjectForm {
  readonly name: string;
  readonly description?: string;
}

export const validateProjectForm = (
  input: ProjectFormInput,
): Result<Readonly<ValidatedProjectForm>, FieldErrors> => {
  const name = (input.name ?? '').trim();
  const description = (input.description ?? '').trim();

  const errors: Record<string, string> = {
    ...(name.length < 3 || name.length > 80
      ? { name: 'El nombre del proyecto debe tener entre 3 y 80 caracteres' }
      : {}),
    ...(description.length > 500
      ? { description: 'La descripción no puede superar los 500 caracteres' }
      : {}),
  };

  if (Object.keys(errors).length > 0) {
    return err(Object.freeze(errors));
  }

  return ok(
    Object.freeze({
      name,
      description: description || undefined,
    }),
  );
};
