/**
 * useFirestore - Hook personalizado para operaciones CRUD con Firestore
 *
 * Soporta modo offline: las operaciones que fallan por falta de conexión
 * se guardan en una cola local y se sincronizan automáticamente cuando
 * vuelve la conexión.
 */

import { useState, useEffect, useRef } from 'react';
import { FirestoreService } from '@/firebase/services/firestore.service';
import { CacheService } from '@/lib/services/CacheService';
import { OfflineQueueService } from '@/lib/services/OfflineQueueService';
import { useFirebaseAuth } from './useFirebaseAuth';

interface UseFirestore<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  isFromCache: boolean;
  pendingSync: number;
  addItem: (item: Omit<T, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useFirestore<T extends { id?: string }>(collectionName: string): UseFirestore<T> {
  const { user } = useFirebaseAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [pendingSync, setPendingSync] = useState<number>(0);
  const isSyncing = useRef(false);

  const cacheKey = `${collectionName}_${user?.uid || 'public'}`;

  // ── Sincronizar cola offline cuando vuelve la conexión ──────────────────
  const flushQueue = async () => {
    if (!user || isSyncing.current) return;
    const queue = OfflineQueueService.getAll().filter(
      item => item.collection === collectionName && item.userId === user.uid
    );
    if (queue.length === 0) return;

    isSyncing.current = true;
    for (const item of queue) {
      try {
        if (item.operation === 'create') {
          await FirestoreService.create(collectionName, item.data, user.uid);
        } else if (item.operation === 'update' && item.docId) {
          await FirestoreService.update(collectionName, item.docId, item.data as object, user.uid);
        } else if (item.operation === 'delete' && item.docId) {
          await FirestoreService.delete(collectionName, item.docId, user.uid);
        }
        OfflineQueueService.remove(item.id);
      } catch {
        // Si falla de nuevo, dejar en la cola para el próximo intento
      }
    }
    isSyncing.current = false;
    setPendingSync(OfflineQueueService.getAll().filter(
      i => i.collection === collectionName && i.userId === user.uid
    ).length);
  };

  // ── Suscripción a Firestore + caché ─────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    // Cargar caché inmediatamente
    CacheService.get<T[]>(cacheKey).then((cached) => {
      if (cached && cached.length > 0) {
        setData(cached);
        setIsFromCache(true);
        setLoading(false);
      }
    });

    setError(null);
    setPendingSync(OfflineQueueService.getAll().filter(
      i => i.collection === collectionName && i.userId === user.uid
    ).length);

    // Suscripción en tiempo real
    const unsubscribe = FirestoreService.subscribe<T>(
      collectionName,
      user.uid,
      (newData: T[]) => {
        setData(newData);
        setIsFromCache(false);
        setLoading(false);
        if (newData.length > 0) {
          CacheService.set(cacheKey, newData);
        }
      },
      (err: Error) => {
        setError(err);
        setLoading(false);
      }
    );

    // Listener de reconexión — sincronizar cola cuando vuelve internet
    const handleOnline = () => {
      flushQueue();
    };
    window.addEventListener('online', handleOnline);

    // Si ya hay conexión al montar, intentar sincronizar cola pendiente
    if (navigator.onLine) {
      flushQueue();
    }

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, user, cacheKey]);

  // ── addItem ──────────────────────────────────────────────────────────────
  const addItem = async (item: Omit<T, 'id'>): Promise<void> => {
    if (!user) { setError(new Error('Usuario no autenticado')); return; }

    // Optimistic update: agregar al estado local con ID temporal
    const tempId = `temp_${crypto.randomUUID()}`;
    const tempItem = { ...item, id: tempId } as T;
    setData(prev => {
      const updated = [...prev, tempItem];
      CacheService.set(cacheKey, updated);
      return updated;
    });

    if (!navigator.onLine) {
      // Sin internet: encolar para después
      OfflineQueueService.enqueue({
        operation: 'create',
        collection: collectionName,
        data: item,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
      return;
    }

    try {
      setError(null);
      await FirestoreService.create(collectionName, item, user.uid);
      // La suscripción reemplazará el item temporal con el real
    } catch (err) {
      // Si falla por red, encolar
      OfflineQueueService.enqueue({
        operation: 'create',
        collection: collectionName,
        data: item,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
    }
  };

  // ── updateItem ───────────────────────────────────────────────────────────
  const updateItem = async (id: string, updates: Partial<T>): Promise<void> => {
    if (!user) { setError(new Error('Usuario no autenticado')); return; }

    // Optimistic update
    setData(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      CacheService.set(cacheKey, updated);
      return updated;
    });

    if (!navigator.onLine) {
      OfflineQueueService.enqueue({
        operation: 'update',
        collection: collectionName,
        docId: id,
        data: updates,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
      return;
    }

    try {
      setError(null);
      await FirestoreService.update(collectionName, id, updates, user.uid);
    } catch (err) {
      OfflineQueueService.enqueue({
        operation: 'update',
        collection: collectionName,
        docId: id,
        data: updates,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
    }
  };

  // ── deleteItem ───────────────────────────────────────────────────────────
  const deleteItem = async (id: string): Promise<void> => {
    if (!user) { setError(new Error('Usuario no autenticado')); return; }

    // Optimistic update
    setData(prev => {
      const updated = prev.filter(item => item.id !== id);
      CacheService.set(cacheKey, updated);
      return updated;
    });

    if (!navigator.onLine) {
      OfflineQueueService.enqueue({
        operation: 'delete',
        collection: collectionName,
        docId: id,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
      return;
    }

    try {
      setError(null);
      await FirestoreService.delete(collectionName, id, user.uid);
    } catch (err) {
      OfflineQueueService.enqueue({
        operation: 'delete',
        collection: collectionName,
        docId: id,
        userId: user.uid,
      });
      setPendingSync(prev => prev + 1);
    }
  };

  // ── refreshData ──────────────────────────────────────────────────────────
  const refreshData = async (): Promise<void> => {
    if (!user) { setError(new Error('Usuario no autenticado')); return; }
    try {
      setLoading(true);
      setError(null);
      const newData = await FirestoreService.readAll<T>(collectionName, user.uid);
      setData(newData);
      setIsFromCache(false);
      if (newData.length > 0) {
        await CacheService.set(cacheKey, newData);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, isFromCache, pendingSync, addItem, updateItem, deleteItem, refreshData };
}
