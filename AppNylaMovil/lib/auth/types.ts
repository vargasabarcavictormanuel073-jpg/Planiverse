/**
 * Tipos TypeScript para el sistema de autenticación y perfiles de usuario
 * Feature: user-authentication-profiles
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Modelo de usuario con credenciales
 */
export interface User {
  id: string;                    // UUID generado
  email: string;                 // Email único
  passwordHash?: string;         // Hash de contraseña (opcional para OAuth)
  authMethod: 'email' | 'google'; // Método de autenticación
  createdAt: string;             // ISO timestamp
  lastLogin: string;             // ISO timestamp
}

/**
 * Tipo de rol de usuario
 */
export type UserRole = 'student' | 'teacher' | 'other';

/**
 * Modelo de perfil de usuario con datos personales y preferencias
 */
export interface UserProfile {
  userId: string;                // Referencia a User.id
  fullName: string;              // Nombre completo
  nickname: string;              // Apodo (2-20 caracteres)
  age: number;                   // Edad (5-120)
  role: UserRole;                // Rol seleccionado
  selectedModules: string[];     // Módulos seleccionados
  theme: Theme;                  // Tema aplicado
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Modelo de sesión activa
 */
export interface Session {
  userId: string;                // Referencia a User.id
  token: string;                 // Token de sesión (UUID)
  createdAt: string;             // ISO timestamp
  expiresAt: string;             // ISO timestamp (7 días)
}

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Modelo de tema visual
 */
export interface Theme {
  role: UserRole;
  colors: {
    primary: string;             // Color primario
    primaryHover: string;        // Color primario hover
    primaryActive: string;       // Color primario active
    secondary: string;           // Color secundario
    accent: string;              // Color de acento
    background: string;          // Color de fondo
    text: string;                // Color de texto
    textSecondary: string;       // Color de texto secundario
  };
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Resultado de operación de autenticación
 */
export interface AuthResult {
  success: boolean;
  userId?: string;
  isNewUser?: boolean;
  error?: AuthError;
}

/**
 * Códigos de error de autenticación
 */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_already_exists'
  | 'invalid_email'
  | 'weak_password'
  | 'oauth_failed'
  | 'storage_unavailable'
  | 'storage_full'
  | 'session_expired';

/**
 * Errores de autenticación
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Resultado de OAuth
 */
export interface OAuthResult {
  success: boolean;
  email?: string;
  userId?: string;
  error?: AuthError;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Wizard Types
// ============================================================================

/**
 * Tipo de paso del wizard
 */
export type WizardStep = 1 | 2 | 3 | 4 ;

/**
 * Datos del usuario para el paso 3
 */
export interface UserData {
  fullName: string;
  nickname: string;
  age: number;
}

/**
 * Progreso del wizard
 */
export interface WizardProgress {
  userId: string;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  tempData: {
    userData?: UserData;
    selectedRole?: UserRole;
    selectedModules?: string[];
  };
}
