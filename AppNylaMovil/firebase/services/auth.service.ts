/**
 * Servicio de Autenticación con Firebase
 * 
 * Este archivo proporciona todas las funcionalidades de autenticación de usuarios
 * utilizando Firebase Authentication. Incluye:
 * - Registro de usuarios con email/password
 * - Inicio de sesión con email/password
 * - Inicio de sesión con Google OAuth
 * - Cierre de sesión
 * - Observación de cambios en el estado de autenticación
 * - Manejo de errores con mensajes en español
 * 
 * Cada operación de autenticación crea o verifica el perfil del usuario en Firestore.
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthError;
}

export interface AuthError {
  code: string;
  message: string;
}

export const AuthService = {
  /**
   * Registrar nuevo usuario con email y password
   */
  async register(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Crear documento de perfil inicial en Firestore
      await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
        userId: user.uid,
        email: user.email,
        authMethod: 'email',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, user };
    } catch (error) {
      const err = error as { code?: string };
      return {
        success: false,
        error: {
          code: err.code || 'unknown',
          message: this.getErrorMessage(err.code || 'unknown')
        }
      };
    }
  },

  /**
   * Login con email y password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      const err = error as { code?: string };
      return {
        success: false,
        error: {
          code: err.code || 'unknown',
          message: this.getErrorMessage(err.code || 'unknown')
        }
      };
    }
  },

  /**
   * Login con Google OAuth (usando popup)
   */
  async loginWithGoogle(): Promise<AuthResult> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Verificar si el perfil ya existe
      const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);
      
      // Si no existe, crear perfil inicial
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          userId: user.uid,
          email: user.email,
          authMethod: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return { success: true, user };
    } catch (error) {
      const err = error as { code?: string };
      
      // Si el usuario cierra el popup, no mostrar error
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false };
      }
      
      return {
        success: false,
        error: {
          code: err.code || 'unknown',
          message: this.getErrorMessage(err.code || 'unknown')
        }
      };
    }
  },

  /**
   * Enviar correo de recuperación de contraseña
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://planiverse.vercel.app/',
      });
      return { success: true };
    } catch (error) {
      const err = error as { code?: string };
      return {
        success: false,
        error: this.getErrorMessage(err.code || 'unknown')
      };
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Eliminar cuenta de usuario (datos en Firestore y autenticación)
   */
  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      // 1. Eliminar datos de Firestore
      try {
        // Eliminar documento de perfil
        const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
        await setDoc(profileRef, { deletedAt: serverTimestamp() }, { merge: true });
        
        // Nota: En producción, deberías usar una Cloud Function para eliminar
        // todos los datos del usuario de forma segura
      } catch (err) {
        console.warn('Error eliminando datos de Firestore:', err);
        // Continuar con la eliminación de la cuenta de Firebase
      }

      // 2. Eliminar cuenta de Firebase Authentication
      await user.delete();

      // 3. Limpiar localStorage
      localStorage.clear();

      return { success: true };
    } catch (error) {
      const err = error as { code?: string };
      return {
        success: false,
        error: this.getErrorMessage(err.code || 'unknown')
      };
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Observar cambios de autenticación
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return firebaseOnAuthStateChanged(auth, callback);
  },

  /**
   * Convertir códigos de error de Firebase a mensajes user-friendly
   */
  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'El email no es válido';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Credenciales incorrectas';
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/network-request-failed':
        return 'Sin conexión a internet';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana de autenticación';
      case 'auth/popup-closed-by-user':
        return 'Autenticación cancelada';
      case 'auth/cancelled-popup-request':
        return 'Solicitud de autenticación cancelada';
      case 'auth/user-token-expired':
        return 'Sesión expirada, por favor inicia sesión nuevamente';
      default:
        return 'Error de autenticación';
    }
  }
};
