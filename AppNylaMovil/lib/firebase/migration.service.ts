/**
 * Servicio de Migración de Datos
 * 
 * Este archivo maneja la migración de datos desde localStorage hacia Firestore.
 * Se utiliza cuando un usuario existente con datos en localStorage necesita
 * migrar sus datos a la base de datos en la nube.
 * 
 * Funcionalidades incluidas:
 * - Detectar si hay datos en localStorage
 * - Migrar perfil de usuario
 * - Migrar colecciones (tasks, notes, calendar, routines, reminders)
 * - Convertir fechas de string a Timestamps de Firebase
 * - Limpiar localStorage después de migración exitosa
 * - Manejo de errores por colección
 */

import { FirestoreService } from './firestore.service';
import { Timestamp } from 'firebase/firestore';

export interface MigrationResult {
  success: boolean;
  migratedCollections: string[];
  errors?: MigrationError[];
}

export interface MigrationError {
  collection: string;
  message: string;
}

export const MigrationService = {
  /**
   * Detectar si hay datos en localStorage
   */
  hasLocalStorageData(userId: string): boolean {
    try {
      const keys = Object.keys(localStorage);
      const planiverseKeys = keys.filter(key => key.startsWith('planiverse_'));
      
      // Excluir keys de sesión y configuración
      const dataKeys = planiverseKeys.filter(key => 
        !key.includes('session') && 
        !key.includes('theme') &&
        key !== 'planiverse_role'
      );
      
      return dataKeys.length > 0;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  },

  /**
   * Migrar todos los datos de un usuario
   */
  async migrateUserData(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCollections: [],
      errors: []
    };

    console.log('🔄 Iniciando migración de datos...');

    // Migrar perfil
    try {
      await this.migrateProfile(userId);
      result.migratedCollections.push('profile');
      console.log('✅ Perfil migrado');
    } catch (error: unknown) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      result.errors?.push({
        collection: 'profile',
        message: errorMessage
      });
      console.error('❌ Error migrando perfil:', error);
    }

    // Migrar colecciones
    const collections = ['tasks', 'notes', 'calendar', 'routines', 'reminders'];
    
    for (const collectionName of collections) {
      try {
        const data = this.getLocalStorageData(collectionName);
        if (data && data.length > 0) {
          await this.migrateCollection(collectionName, userId, data);
          result.migratedCollections.push(collectionName);
          console.log(`✅ ${collectionName} migrado (${data.length} items)`);
        }
      } catch (error: unknown) {
        result.success = false;
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors?.push({
          collection: collectionName,
          message: errorMessage
        });
        console.error(`❌ Error migrando ${collectionName}:`, error);
      }
    }

    // Solo limpiar localStorage si TODO fue exitoso
    if (result.success && result.errors?.length === 0) {
      this.clearLocalStorage(userId);
      console.log('🧹 localStorage limpiado');
    } else {
      console.warn('⚠️ Migración parcial, localStorage no limpiado');
    }

    return result;
  },

  /**
   * Migrar perfil de usuario
   */
  async migrateProfile(userId: string): Promise<void> {
    const roleData = localStorage.getItem('planiverse_role');
    const profileData = localStorage.getItem('planiverse_profile');
    
    if (!profileData) {
      return; // No hay perfil que migrar
    }

    try {
      const profile = JSON.parse(profileData);
      
      const profileDoc = {
        userId,
        role: roleData || 'other',
        fullName: profile.fullName || '',
        nickname: profile.nickname || '',
        age: profile.age || 0,
        selectedModules: profile.selectedModules || [],
        theme: profile.theme || { mode: 'light', primaryColor: '#3B82F6' }
      };

      await FirestoreService.create('profile', profileDoc, userId);
    } catch (error) {
      console.error('Error parsing profile data:', error);
      throw new Error('Datos de perfil corruptos');
    }
  },

  /**
   * Migrar colección específica
   */
  async migrateCollection(
    collectionName: string,
    userId: string,
    data: unknown[]
  ): Promise<void> {
    for (const item of data) {
      try {
        // Convertir Date strings a Timestamps
        const migratedItem = this.convertDatesToTimestamps(item);
        
        // Remover el id si existe (Firestore generará uno nuevo)
        const { id, ...itemData } = migratedItem as { id?: string; [key: string]: unknown };
        
        await FirestoreService.create(collectionName, itemData, userId);
      } catch (error) {
        console.error(`Error migrating item in ${collectionName}:`, error);
        // Continuar con el siguiente item
      }
    }
  },

  /**
   * Obtener datos de localStorage para una colección
   */
  getLocalStorageData(collectionName: string): unknown[] {
    try {
      const key = `planiverse_${collectionName}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collectionName} from localStorage:`, error);
      return [];
    }
  },

  /**
   * Convertir Date strings a Timestamps de Firebase
   */
  convertDatesToTimestamps(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const isArray = Array.isArray(obj);
    const converted: unknown = isArray ? [] : {};
    const objRecord = obj as Record<string, unknown>;

    for (const key in objRecord) {
      const value = objRecord[key];

      // Detectar campos de fecha comunes
      if (
        (key.includes('Date') || key.includes('At') || key === 'date' || key === 'time') &&
        typeof value === 'string'
      ) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            (converted as Record<string, unknown>)[key] = Timestamp.fromDate(date);
            continue;
          }
        } catch (error) {
          // Si falla la conversión, mantener el valor original
        }
      }

      // Recursión para objetos anidados
      if (typeof value === 'object' && value !== null) {
        (converted as Record<string, unknown>)[key] = this.convertDatesToTimestamps(value);
      } else {
        (converted as Record<string, unknown>)[key] = value;
      }
    }

    return converted;
  },

  /**
   * Limpiar localStorage después de migración exitosa
   */
  clearLocalStorage(userId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const planiverseKeys = keys.filter(key => key.startsWith('planiverse_'));
      
      // Mantener solo session y theme
      const keysToRemove = planiverseKeys.filter(key => 
        !key.includes('session') && 
        !key.includes('theme')
      );

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`🧹 Limpiados ${keysToRemove.length} items de localStorage`);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
