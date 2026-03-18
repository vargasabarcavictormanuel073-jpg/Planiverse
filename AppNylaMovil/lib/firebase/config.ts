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
import { getFirestore } from 'firebase/firestore';

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
let db;
try {
  db = getFirestore(app);
} catch {
  db = getFirestore(app);
}

export { app, auth, db };
