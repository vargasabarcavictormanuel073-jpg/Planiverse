/**
 * Constantes para el sistema de autenticación y perfiles de usuario
 * Feature: user-authentication-profiles
 */

import { Theme, UserRole } from './types';

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * Claves utilizadas en localStorage
 */
export const STORAGE_KEYS = {
  USERS: 'planiverse_users',                    // User[]
  PROFILES: 'planiverse_profiles',              // Record<userId, UserProfile>
  SESSION: 'planiverse_session',                // Session
  WIZARD_PROGRESS: 'planiverse_wizard_progress' // WizardProgress
} as const;

// ============================================================================
// Themes
// ============================================================================

/**
 * Temas predefinidos por rol
 * 
 * - student: Esquema azul/verde (tonos calmados y enfocados)
 * - teacher: Esquema naranja/rojo (tonos energéticos y profesionales)
 * - other: Esquema morado/gris (tonos neutrales y versátiles)
 */
export const THEMES: Record<UserRole, Theme> = {
  student: {
    role: 'student',
    colors: {
      primary: '#3B82F6',        // blue-500
      primaryHover: '#2563EB',   // blue-600
      primaryActive: '#1D4ED8',  // blue-700
      secondary: '#10B981',      // green-500
      accent: '#06B6D4',         // cyan-500
      background: '#F0F9FF',     // blue-50
      text: '#1E293B',           // slate-800
      textSecondary: '#64748B',  // slate-500
    }
  },
  teacher: {
    role: 'teacher',
    colors: {
      primary: '#F97316',        // orange-500
      primaryHover: '#EA580C',   // orange-600
      primaryActive: '#C2410C',  // orange-700
      secondary: '#EF4444',      // red-500
      accent: '#F59E0B',         // amber-500
      background: '#FFF7ED',     // orange-50
      text: '#1E293B',           // slate-800
      textSecondary: '#64748B',  // slate-500
    }
  },
  other: {
    role: 'other',
    colors: {
      primary: '#8B5CF6',        // violet-500
      primaryHover: '#7C3AED',   // violet-600
      primaryActive: '#6D28D9',  // violet-700
      secondary: '#6B7280',      // gray-500
      accent: '#A855F7',         // purple-500
      background: '#F5F3FF',     // violet-50
      text: '#1E293B',           // slate-800
      textSecondary: '#64748B',  // slate-500
    }
  }
};

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Constantes de validación
 */
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  AGE_MIN: 5,
  AGE_MAX: 120,
  SESSION_DURATION_DAYS: 7,
} as const;

// ============================================================================
// OAuth Constants
// ============================================================================

/**
 * Constantes de OAuth (simulación frontend)
 */
export const OAUTH_CONFIG = {
  GOOGLE_CLIENT_ID: 'mock-google-client-id',
  REDIRECT_URI: '/auth/callback',
  SCOPES: ['email', 'profile'],
} as const;
