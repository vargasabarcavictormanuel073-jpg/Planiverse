/**
 * useFirestore - Hook personalizado para operaciones CRUD con Firestore
 * 
 * Este hook proporciona una interfaz simple para trabajar con colecciones de Firestore.
 * Se suscribe automáticamente a cambios en tiempo real y actualiza el estado.
 * 
 * Parámetros:
 * - collectionName: Nombre de la colección en Firestore (ej: 'tasks', 'notes')
 * 
 * Retorna:
 * - data: Array de documentos de la colección
 * - loading: Estado de carga
 * - error: Errores si ocurren
 * - addItem: Función para agregar un nuevo documento
 * - updateItem: Función para actualizar un documento existente
 * - deleteItem: Función para eliminar un documento
 * - refreshData: Función para refrescar los datos manualmente
 * 
 * El hook requiere que el usuario esté autenticado y limpia automáticamente
 * las suscripciones cuando el componente se desmonta.
 */

import { useState, useEffect } from 'react';
import { FirestoreService } from '@/lib/firebase/firestore.service';
import { CacheService } from '@/lib/services/CacheService';
import { useFirebaseAuth } from './useFirebaseAuth';

interface UseFirestore<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  isFromCache: boolean;
  addItem: (item: Omit<T, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useFirestore<T>(collectionName: string): UseFirestore<T> {
  const { user } = useFirebaseAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const cacheKey = `${collectionName}_${user?.uid || 'public'}`;

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    // 1. Intentar cargar del caché primero
    CacheService.get<T[]>(cacheKey).then((cached) => {
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setLoading(false);
      }
    });

    setError(null);

    // 2. Suscribirse a cambios en tiempo real (sincronización en background)
    const unsubscribe = FirestoreService.subscribe<T>(
      collectionName,
      user.uid,
      (newData) => {
        setData(newData);
        setIsFromCache(false);
        setLoading(false);
        // Guardar en caché
        CacheService.set(cacheKey, newData);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie el usuario
    return () => unsubscribe();
  }, [collectionName, user, cacheKey]);

  /**
   * Agregar nuevo item
   */
  const addItem = async (item: Omit<T, 'id'>): Promise<void> => {
    if (!user) {
      setError(new Error('Usuario no autenticado'));
      return;
    }

    try {
      setError(null);
      await FirestoreService.create(collectionName, item, user.uid);
      // La suscripción actualizará automáticamente el estado
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Actualizar item existente
   */
  const updateItem = async (id: string, updates: Partial<T>): Promise<void> => {
    if (!user) {
      setError(new Error('Usuario no autenticado'));
      return;
    }

    try {
      setError(null);
      await FirestoreService.update(collectionName, id, updates, user.uid);
      // La suscripción actualizará automáticamente el estado
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Eliminar item
   */
  const deleteItem = async (id: string): Promise<void> => {
    if (!user) {
      setError(new Error('Usuario no autenticado'));
      return;
    }

    try {
      setError(null);
      await FirestoreService.delete(collectionName, id, user.uid);
      // La suscripción actualizará automáticamente el estado
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Refrescar datos manualmente
   */
  const refreshData = async (): Promise<void> => {
    if (!user) {
      setError(new Error('Usuario no autenticado'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newData = await FirestoreService.readAll<T>(collectionName, user.uid);
      setData(newData);
      setIsFromCache(false);
      // Actualizar caché
      await CacheService.set(cacheKey, newData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    isFromCache,
    addItem,
    updateItem,
    deleteItem,
    refreshData
  };
}
