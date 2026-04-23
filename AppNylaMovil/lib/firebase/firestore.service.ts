/**
 * Servicio de Firestore para operaciones CRUD
 * 
 * Este archivo proporciona todas las operaciones de base de datos con Firestore.
 * Maneja las colecciones de datos de cada usuario de forma aislada bajo la ruta:
 * users/{userId}/{collectionName}/{docId}
 * 
 * Funcionalidades incluidas:
 * - Crear documentos (create)
 * - Leer documentos individuales (read)
 * - Leer todos los documentos de una colección (readAll)
 * - Actualizar documentos (update)
 * - Eliminar documentos (delete)
 * - Suscripciones en tiempo real (subscribe)
 * - Conversión de fechas y timestamps
 * - Manejo de errores con mensajes en español
 */

import { 
  collection, 
  doc,
  addDoc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

export const FirestoreService = {
  /**
   * Crear documento en una colección
   */
  async create<T>(
    collectionName: string,
    data: T,
    userId: string
  ): Promise<string> {
    try {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      
      const err = error as { code?: string };
      if (err.code === 'unavailable') {
        throw new Error('Sin conexión a internet');
      }
      if (err.code === 'permission-denied') {
        throw new Error('No tienes permiso para esta operación');
      }
      
      throw new Error('Error al guardar datos');
    }
  },

  /**
   * Leer documento por ID
   */
  async read<T>(
    collectionName: string,
    docId: string,
    userId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      
      const err = error as { code?: string };
      if (err.code === 'unavailable') {
        throw new Error('Sin conexión a internet');
      }
      if (err.code === 'permission-denied') {
        throw new Error('No tienes permiso para esta operación');
      }
      
      throw new Error('Error al cargar datos');
    }
  },

  /**
   * Leer todos los documentos de una colección
   */
  async readAll<T>(
    collectionName: string,
    userId: string
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const q = query(collectionRef);
      const querySnapshot = await getDocs(q);
      
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      
      return documents;
    } catch (error) {
      console.error(`Error reading all documents from ${collectionName}:`, error);
      
      const err = error as { code?: string };
      if (err.code === 'unavailable') {
        throw new Error('Sin conexión a internet');
      }
      if (err.code === 'permission-denied') {
        throw new Error('No tienes permiso para esta operación');
      }
      
      throw new Error('Error al cargar datos');
    }
  },

  /**
   * Actualizar documento (o crear si no existe con setDoc)
   */
  async update<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      
      // Usar setDoc con merge para crear o actualizar
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      
      const err = error as { code?: string };
      if (err.code === 'unavailable') {
        throw new Error('Sin conexión a internet');
      }
      if (err.code === 'permission-denied') {
        throw new Error('No tienes permiso para esta operación');
      }
      
      throw new Error('Error al actualizar datos');
    }
  },

  /**
   * Eliminar documento
   */
  async delete(
    collectionName: string,
    docId: string,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      
      const err = error as { code?: string };
      if (err.code === 'unavailable') {
        throw new Error('Sin conexión a internet');
      }
      if (err.code === 'permission-denied') {
        throw new Error('No tienes permiso para esta operación');
      }
      
      throw new Error('Error al eliminar datos');
    }
  },

  /**
   * Suscribirse a cambios en tiempo real de una colección
   */
  subscribe<T>(
    collectionName: string,
    userId: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const collectionRef = collection(db, 'users', userId, collectionName);
    const q = query(collectionRef);
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const documents: T[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() } as T);
        });
        callback(documents);
      },
      (error) => {
        console.error(`Error in subscription for ${collectionName}:`, error);
        
        if (errorCallback) {
          if (error.code === 'unavailable') {
            errorCallback(new Error('Sin conexión a internet'));
          } else if (error.code === 'permission-denied') {
            errorCallback(new Error('No tienes permiso para esta operación'));
          } else {
            errorCallback(new Error('Error al sincronizar datos'));
          }
        }
      }
    );
  },

  /**
   * Convertir Date a Timestamp de Firebase
   */
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  },

  /**
   * Convertir Timestamp de Firebase a Date
   */
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }
};
