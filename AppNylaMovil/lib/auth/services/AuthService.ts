/**
 * AuthService - Servicio para gestión de autenticación
 * Feature: user-authentication-profiles
 * 
 * Proporciona métodos para autenticación OAuth simulada, email/password,
 * gestión de sesiones y hashing de contraseñas usando Web Crypto API.
 */

import { User, Session, AuthResult, OAuthResult, AuthError } from '../types';
import { VALIDATION_RULES, OAUTH_CONFIG } from '../constants';
import { LocalStorageManager } from './LocalStorageManager';
import { ValidationService } from './ValidationService';

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Hash de contraseña usando Web Crypto API (SubtleCrypto)
   * @param password - Contraseña en texto plano
   * @returns Hash de contraseña en formato hexadecimal
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Verifica una contraseña contra un hash
   * @param password - Contraseña en texto plano
   * @param hash - Hash almacenado
   * @returns true si la contraseña coincide con el hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Genera un token de sesión único (UUID v4)
   * @returns Token de sesión
   */
  private static generateSessionToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Genera un ID de usuario único (UUID v4)
   * @returns ID de usuario
   */
  private static generateUserId(): string {
    return crypto.randomUUID();
  }

  /**
   * Crea una nueva sesión para un usuario
   * @param userId - ID del usuario
   * @returns Sesión creada
   */
  private static createSession(userId: string): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + VALIDATION_RULES.SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    return {
      userId,
      token: this.generateSessionToken(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Login con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Resultado de autenticación
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Validar formato de email
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'invalid_email',
            message: emailValidation.error || 'Email inválido',
          },
        };
      }

      // Validar contraseña
      const passwordValidation = ValidationService.validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'weak_password',
            message: passwordValidation.error || 'Contraseña inválida',
          },
        };
      }

      // Buscar usuario por email
      const user = LocalStorageManager.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'invalid_credentials',
            message: 'Credenciales incorrectas',
          },
        };
      }

      // Verificar contraseña
      if (!user.passwordHash) {
        return {
          success: false,
          error: {
            code: 'invalid_credentials',
            message: 'Credenciales incorrectas',
          },
        };
      }

      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: {
            code: 'invalid_credentials',
            message: 'Credenciales incorrectas',
          },
        };
      }

      // Actualizar último login
      user.lastLogin = new Date().toISOString();
      LocalStorageManager.saveUser(user);

      // Crear sesión
      const session = this.createSession(user.id);
      LocalStorageManager.saveSession(session);

      return {
        success: true,
        userId: user.id,
        isNewUser: false,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'StorageError') {
        return {
          success: false,
          error: {
            code: 'storage_unavailable',
            message: 'Error al acceder al almacenamiento',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'Error al iniciar sesión',
        },
      };
    }
  }

  /**
   * Registro de nuevo usuario con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Resultado de autenticación
   */
  static async register(email: string, password: string): Promise<AuthResult> {
    try {
      // Validar formato de email
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'invalid_email',
            message: emailValidation.error || 'Email inválido',
          },
        };
      }

      // Validar contraseña
      const passwordValidation = ValidationService.validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'weak_password',
            message: passwordValidation.error || 'Contraseña débil',
          },
        };
      }

      // Verificar que el email no exista
      const existingUser = LocalStorageManager.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'email_already_exists',
            message: 'El email ya está registrado',
          },
        };
      }

      // Hash de contraseña
      const passwordHash = await this.hashPassword(password);

      // Crear nuevo usuario
      const now = new Date().toISOString();
      const newUser: User = {
        id: this.generateUserId(),
        email: email.toLowerCase(),
        passwordHash,
        authMethod: 'email',
        createdAt: now,
        lastLogin: now,
      };

      // Guardar usuario
      LocalStorageManager.saveUser(newUser);

      // Crear sesión
      const session = this.createSession(newUser.id);
      LocalStorageManager.saveSession(session);

      return {
        success: true,
        userId: newUser.id,
        isNewUser: true,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'StorageError') {
        const storageError = error as { code?: string };
        if (storageError.code === 'full') {
          return {
            success: false,
            error: {
              code: 'storage_full',
              message: 'Almacenamiento lleno. Por favor, libera espacio.',
            },
          };
        }
        return {
          success: false,
          error: {
            code: 'storage_unavailable',
            message: 'Error al acceder al almacenamiento',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'invalid_email',
          message: 'Error al registrar usuario',
        },
      };
    }
  }

  /**
   * Inicia el flujo de OAuth con Google (simulación frontend)
   * @returns Resultado de OAuth con email simulado
   */
  static async initiateGoogleOAuth(): Promise<OAuthResult> {
    try {
      // Simulación de flujo OAuth
      // En un entorno real, esto redirigiría a Google OAuth
      // Para simulación, generamos un email aleatorio
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simular respuesta de OAuth (85% éxito, 15% fallo para testing)
      const shouldSucceed = Math.random() > 0.15;

      if (!shouldSucceed) {
        return {
          success: false,
          error: {
            code: 'oauth_failed',
            message: 'Error al autenticar con Google',
          },
        };
      }

      // Generar email simulado
      const randomId = Math.random().toString(36).substring(7);
      const simulatedEmail = `user_${randomId}@gmail.com`;

      return {
        success: true,
        email: simulatedEmail,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'oauth_failed',
          message: 'Error al iniciar OAuth',
        },
      };
    }
  }

  /**
   * Maneja el callback de OAuth (simulación frontend)
   * @param email - Email obtenido del proveedor OAuth
   * @returns Resultado de autenticación
   */
  static async handleOAuthCallback(email: string): Promise<AuthResult> {
    try {
      // Validar email
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'invalid_email',
            message: 'Email inválido recibido de OAuth',
          },
        };
      }

      // Buscar usuario existente
      let user = LocalStorageManager.getUserByEmail(email);
      let isNewUser = false;

      if (!user) {
        // Crear nuevo usuario OAuth
        const now = new Date().toISOString();
        user = {
          id: this.generateUserId(),
          email: email.toLowerCase(),
          authMethod: 'google',
          createdAt: now,
          lastLogin: now,
        };
        LocalStorageManager.saveUser(user);
        isNewUser = true;
      } else {
        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        LocalStorageManager.saveUser(user);
      }

      // Crear sesión
      const session = this.createSession(user.id);
      LocalStorageManager.saveSession(session);

      return {
        success: true,
        userId: user.id,
        isNewUser,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'StorageError') {
        const storageError = error as { code?: string };
        if (storageError.code === 'full') {
          return {
            success: false,
            error: {
              code: 'storage_full',
              message: 'Almacenamiento lleno. Por favor, libera espacio.',
            },
          };
        }
        return {
          success: false,
          error: {
            code: 'storage_unavailable',
            message: 'Error al acceder al almacenamiento',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'oauth_failed',
          message: 'Error al procesar OAuth',
        },
      };
    }
  }

  /**
   * Obtiene la sesión actual
   * @returns Sesión actual o null si no existe
   */
  static getCurrentSession(): Session | null {
    try {
      return LocalStorageManager.getSession();
    } catch (error) {
      return null;
    }
  }

  /**
   * Cierra la sesión actual
   */
  static logout(): void {
    try {
      LocalStorageManager.clearSession();
    } catch (error) {
      // Ignorar errores de logout
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Verifica si una sesión es válida (no expirada)
   * @param session - Sesión a validar
   * @returns true si la sesión es válida
   */
  static isSessionValid(session: Session | null): boolean {
    if (!session) {
      return false;
    }

    try {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      return now < expiresAt;
    } catch (error) {
      return false;
    }
  }
}
