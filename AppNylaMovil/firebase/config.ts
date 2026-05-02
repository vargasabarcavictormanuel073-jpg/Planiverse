/**
 * Configuración de Firebase
 * 
 * Este archivo inicializa la conexión con Firebase utilizando las credenciales
 * del proyecto almacenadas en las variables de entorno (.env.local).
 * 
 * Exporta tres instancias principales:
 * - app: La aplicación Firebase inicializada
 * - auth: Servicio de autenticación
 * - db: Servicio de Firestore (base de datos)
 * 
 * La inicialización verifica si Firebase ya está inicializado para evitar
 * múltiples instancias en desarrollo con hot-reload.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Inicializar Firestore
let db: Firestore;
try {
  db = getFirestore(app);
} catch {
  db = getFirestore(app);
}

// Activar persistencia offline nativa de Firestore (IndexedDB)
// Esto hace que Firestore guarde y sincronice operaciones automáticamente
// cuando no hay internet — sin necesidad de lógica manual
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Múltiples pestañas abiertas — la persistencia solo funciona en una
      console.warn('Firestore offline: múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      // El navegador no soporta IndexedDB
      console.warn('Firestore offline: navegador no soportado');
    }
  });
}

export { app, auth, db };
