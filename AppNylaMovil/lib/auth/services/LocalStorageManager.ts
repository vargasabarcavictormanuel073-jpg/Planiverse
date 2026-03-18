/**
 * LocalStorageManager - Servicio para gestión de persistencia en localStorage
 * Feature: user-authentication-profiles
 * 
 * Proporciona métodos CRUD para usuarios, perfiles y sesiones con manejo
 * robusto de errores para localStorage no disponible o lleno.
 */

import { User, UserProfile, Session } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Errores personalizados para operaciones de localStorage
 */
export class StorageError extends Error {
  constructor(message: string, public code: 'unavailable' | 'full' | 'read_error' | 'write_error') {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Servicio para gestión de persistencia en localStorage
 */
export class LocalStorageManager {
  /**
   * Verifica si localStorage está disponible
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el tamaño aproximado usado en localStorage (en bytes)
   */
  static getStorageSize(): number {
    if (!this.isAvailable()) {
      return 0;
    }

    let total = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          if (value) {
            total += key.length + value.length;
          }
        }
      }
    } catch {
      return 0;
    }

    return total;
  }

  /**
   * Limpia todos los datos de Planiverse de localStorage
   */
  static clearAll(): void {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      throw new StorageError('Error al limpiar localStorage', 'write_error');
    }
  }

  // ============================================================================
  // User Methods
  // ============================================================================

  /**
   * Guarda un usuario en localStorage
   * Valida la escritura leyendo los datos después de guardar
   */
  static saveUser(user: User): void {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      // Obtener usuarios existentes
      const users = this.getAllUsers();
      
      // Buscar si el usuario ya existe
      const existingIndex = users.findIndex(u => u.id === user.id);
      
      if (existingIndex >= 0) {
        // Actualizar usuario existente
        users[existingIndex] = user;
      } else {
        // Agregar nuevo usuario
        users.push(user);
      }

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Validar escritura
      const savedUser = this.getUser(user.id);
      if (!savedUser || savedUser.id !== user.id) {
        throw new StorageError('Error al validar escritura de usuario', 'write_error');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      // Detectar QuotaExceededError
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        throw new StorageError(
          'localStorage está lleno. Por favor, libera espacio eliminando datos antiguos.',
          'full'
        );
      }

      throw new StorageError('Error al guardar usuario', 'write_error');
    }
  }

  /**
   * Obtiene un usuario por su ID
   */
  static getUser(userId: string): User | null {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      const users = this.getAllUsers();
      return users.find(u => u.id === userId) || null;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Error al leer usuario', 'read_error');
    }
  }

  /**
   * Obtiene un usuario por su email
   */
  static getUserByEmail(email: string): User | null {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      const users = this.getAllUsers();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Error al leer usuario por email', 'read_error');
    }
  }

  /**
   * Obtiene todos los usuarios (método privado auxiliar)
   */
  private static getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as User[];
    } catch {
      return [];
    }
  }

  // ============================================================================
  // Profile Methods
  // ============================================================================

  /**
   * Guarda un perfil de usuario en localStorage
   * Valida la escritura leyendo los datos después de guardar
   */
  static saveProfile(profile: UserProfile): void {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      // Obtener perfiles existentes
      const profiles = this.getAllProfiles();
      
      // Actualizar o agregar perfil
      profiles[profile.userId] = profile;

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

      // Validar escritura
      const savedProfile = this.getProfile(profile.userId);
      if (!savedProfile || savedProfile.userId !== profile.userId) {
        throw new StorageError('Error al validar escritura de perfil', 'write_error');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      // Detectar QuotaExceededError
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        throw new StorageError(
          'localStorage está lleno. Por favor, libera espacio eliminando datos antiguos.',
          'full'
        );
      }

      throw new StorageError('Error al guardar perfil', 'write_error');
    }
  }

  /**
   * Obtiene un perfil de usuario por su userId
   */
  static getProfile(userId: string): UserProfile | null {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      const profiles = this.getAllProfiles();
      return profiles[userId] || null;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Error al leer perfil', 'read_error');
    }
  }

  /**
   * Obtiene todos los perfiles (método privado auxiliar)
   */
  private static getAllProfiles(): Record<string, UserProfile> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!data) {
        return {};
      }
      return JSON.parse(data) as Record<string, UserProfile>;
    } catch {
      return {};
    }
  }

  // ============================================================================
  // Session Methods
  // ============================================================================

  /**
   * Guarda una sesión en localStorage
   * Valida la escritura leyendo los datos después de guardar
   */
  static saveSession(session: Session): void {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

      // Validar escritura
      const savedSession = this.getSession();
      if (!savedSession || savedSession.token !== session.token) {
        throw new StorageError('Error al validar escritura de sesión', 'write_error');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      // Detectar QuotaExceededError
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        throw new StorageError(
          'localStorage está lleno. Por favor, libera espacio eliminando datos antiguos.',
          'full'
        );
      }

      throw new StorageError('Error al guardar sesión', 'write_error');
    }
  }

  /**
   * Obtiene la sesión actual
   */
  static getSession(): Session | null {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as Session;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Error al leer sesión', 'read_error');
    }
  }

  /**
   * Limpia la sesión actual
   */
  static clearSession(): void {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage no está disponible', 'unavailable');
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      throw new StorageError('Error al limpiar sesión', 'write_error');
    }
  }
}
