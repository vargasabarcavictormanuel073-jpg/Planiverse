/**
 * Exportaciones centralizadas del módulo de autenticación
 * Feature: user-authentication-profiles
 */

// Tipos
export type {
  User,
  UserRole,
  UserProfile,
  Session,
  Theme,
  AuthResult,
  AuthError,
  AuthErrorCode,
  OAuthResult,
  ValidationResult,
  WizardStep,
  UserData,
  WizardProgress,
} from './types';

// Constantes
export {
  STORAGE_KEYS,
  THEMES,
  VALIDATION_RULES,
  OAUTH_CONFIG,
} from './constants';
