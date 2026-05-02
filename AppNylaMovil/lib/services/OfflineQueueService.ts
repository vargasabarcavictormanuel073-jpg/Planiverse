/**
 * OfflineQueueService - Cola de operaciones pendientes para modo offline
 *
 * Guarda en localStorage las operaciones (create, update, delete) que
 * el usuario hace sin internet. Cuando vuelve la conexión, las ejecuta
 * en orden contra Firestore.
 */

export type QueueOperation = 'create' | 'update' | 'delete';

export interface QueueItem {
  id: string;           // ID único de la operación en la cola
  operation: QueueOperation;
  collection: string;
  docId?: string;       // Para update y delete
  data?: unknown;       // Para create y update
  userId: string;
  timestamp: number;
}

const QUEUE_KEY = 'planiverse_offline_queue';

export class OfflineQueueService {
  /**
   * Agrega una operación a la cola
   */
  static enqueue(item: Omit<QueueItem, 'id' | 'timestamp'>): void {
    try {
      const queue = this.getAll();
      const newItem: QueueItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      queue.push(newItem);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      console.warn('No se pudo encolar la operación offline');
    }
  }

  /**
   * Obtiene todas las operaciones pendientes
   */
  static getAll(): QueueItem[] {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as QueueItem[];
    } catch {
      return [];
    }
  }

  /**
   * Elimina una operación de la cola por su ID
   */
  static remove(id: string): void {
    try {
      const queue = this.getAll().filter(item => item.id !== id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      console.warn('No se pudo eliminar la operación de la cola');
    }
  }

  /**
   * Limpia toda la cola
   */
  static clear(): void {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {}
  }

  /**
   * Cuántas operaciones hay pendientes
   */
  static count(): number {
    return this.getAll().length;
  }
}
