/**
 * useCachedFirestore - Hook que combina caché local con Firestore
 * 
 * Proporciona:
 * - Datos del caché instantáneamente
 * - Sincronización en background con Firestore
 * - Fallback a Firestore si caché está vacío
 * - Manejo de errores automático
 */

import { useEffect, useState, useCallback } from 'react';
import { CacheService } from '@/lib/services/CacheService';
import { FirestoreService } from '@/lib/firebase/firestore.service';

interface UseCachedFirestoreOptions {
  ttl?: number; // Time to live en milisegundos
  skipCache?: boolean; // Saltar caché y ir directo a Firestore
}

interface UseCachedFirestoreResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  isFromCache: boolean;
  refresh: () => Promise<void>;
}

export function useCachedFirestore<T>(
  collection: string,
  userId?: string,
  options: UseCachedFirestoreOptions = {}
): UseCachedFirestoreResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const cacheKey = `${collection}_${userId || 'public'}`;

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // 1. Intentar obtener del caché primero
      if (!options.skipCache) {
        const cached = await CacheService.get<T[]>(cacheKey);
        if (cached) {
          setData(cached);
          setIsFromCache(true);
          setLoading(false);
          // Continuar sincronizando en background
        }
      }

      // 2. Sincronizar con Firestore en background
      if (userId) {
        const firestoreData = await FirestoreService.readCollection<T>(
          'users',
          userId,
          collection
        );

        if (firestoreData) {
          setData(firestoreData);
          setIsFromCache(false);
          
          // Guardar en caché
          await CacheService.set(cacheKey, firestoreData, {
            ttl: options.ttl,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      setLoading(false);

      // Si hay error y no hay caché, mostrar error
      if (!isFromCache) {
        console.error(`Error cargando ${collection}:`, error);
      }
    }
  }, [collection, userId, cacheKey, options, isFromCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isFromCache,
    refresh: fetchData,
  };
}
