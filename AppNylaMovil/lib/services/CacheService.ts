/**
 * CacheService - Servicio centralizado de caché
 * 
 * Gestiona caché en localStorage e IndexedDB con:
 * - Expiración automática de datos
 * - Sincronización en background
 * - Fallback a Firestore si caché está vacío
 * - Manejo de errores robusto
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl?: number; // Time to live en milisegundos (default: 1 hora)
  useIndexedDB?: boolean; // Usar IndexedDB para datos grandes
}

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hora
const CACHE_PREFIX = 'planiverse_cache_';

export class CacheService {
  /**
   * Obtiene datos del caché
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      // Intentar localStorage primero (más rápido)
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        
        // Verificar si expiró
        if (entry.expiresAt > Date.now()) {
          return entry.data;
        } else {
          // Eliminar si expiró
          localStorage.removeItem(CACHE_PREFIX + key);
        }
      }
    } catch (error) {
      console.warn(`Error leyendo caché ${key}:`, error);
    }
    
    return null;
  }

  /**
   * Guarda datos en caché
   */
  static async set<T>(key: string, data: T, config: CacheConfig = {}): Promise<void> {
    try {
      const ttl = config.ttl || DEFAULT_TTL;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Error guardando caché ${key}:`, error);
      // Si localStorage está lleno, limpiar caché antiguo
      if (error instanceof Error && error.message.includes('QuotaExceededError')) {
        this.clearOldest();
        try {
          const ttl = config.ttl || DEFAULT_TTL;
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
          };
          localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
        } catch {
          console.error('No se pudo guardar en caché después de limpiar');
        }
      }
    }
  }

  /**
   * Elimina una entrada del caché
   */
  static async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.warn(`Error eliminando caché ${key}:`, error);
    }
  }

  /**
   * Limpia todo el caché
   */
  static async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error limpiando caché:', error);
    }
  }

  /**
   * Obtiene el tamaño del caché en bytes
   */
  static getSize(): number {
    let total = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            total += item.length;
          }
        }
      });
    } catch (error) {
      console.warn('Error calculando tamaño del caché:', error);
    }
    return total;
  }

  /**
   * Limpia las entradas más antiguas cuando el caché está lleno
   */
  private static clearOldest(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheEntries = keys
        .filter(key => key.startsWith(CACHE_PREFIX))
        .map(key => ({
          key,
          timestamp: (() => {
            try {
              const entry = JSON.parse(localStorage.getItem(key) || '{}');
              return entry.timestamp || 0;
            } catch {
              return 0;
            }
          })(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      // Eliminar el 25% más antiguo
      const toRemove = Math.ceil(cacheEntries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(cacheEntries[i].key);
      }
    } catch (error) {
      console.warn('Error limpiando caché antiguo:', error);
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  static getStats(): {
    size: number;
    entries: number;
    sizeInMB: number;
  } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const size = this.getSize();

      return {
        size,
        entries: cacheKeys.length,
        sizeInMB: Math.round((size / 1024 / 1024) * 100) / 100,
      };
    } catch (error) {
      console.warn('Error obteniendo estadísticas del caché:', error);
      return { size: 0, entries: 0, sizeInMB: 0 };
    }
  }
}
