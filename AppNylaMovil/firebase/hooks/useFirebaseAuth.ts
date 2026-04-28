/**
 * useFirebaseAuth - Hook personalizado para autenticación con Firebase
 * 
 * Este hook proporciona acceso al estado de autenticación y métodos para
 * registrar, iniciar sesión y cerrar sesión de usuarios.
 * 
 * Retorna:
 * - user: Usuario actualmente autenticado (o null)
 * - loading: Estado de carga durante la verificación de autenticación
 * - error: Errores de autenticación si ocurren
 * - register: Función para registrar nuevos usuarios
 * - login: Función para iniciar sesión
 * - loginWithGoogle: Función para iniciar sesión con Google
 * - logout: Función para cerrar sesión
 * 
 * El hook se suscribe automáticamente a cambios en el estado de autenticación
 * y limpia la suscripción cuando el componente se desmonta.
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService, AuthError } from '@/firebase/services/auth.service';

interface UseFirebaseAuth {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuth {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Suscribirse a cambios de autenticación
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  /**
   * Registrar nuevo usuario
   */
  const register = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.register(email, password);
      
      if (!result.success) {
        setError(result.error || { code: 'unknown', message: 'Error desconocido' });
      }
    } catch (err) {
      setError({
        code: 'register_failed',
        message: 'Error al registrar usuario'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login con email y password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.login(email, password);
      
      if (!result.success) {
        setError(result.error || { code: 'unknown', message: 'Error desconocido' });
      }
    } catch (err) {
      setError({
        code: 'login_failed',
        message: 'Error al iniciar sesión'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login con Google OAuth
   */
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.loginWithGoogle();
      
      if (!result.success) {
        setError(result.error || { code: 'unknown', message: 'Error desconocido' });
      }
    } catch (err) {
      setError({
        code: 'google_login_failed',
        message: 'Error al iniciar sesión con Google'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await AuthService.logout();
    } catch (err) {
      setError({
        code: 'logout_failed',
        message: 'Error al cerrar sesión'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout
  };
}
