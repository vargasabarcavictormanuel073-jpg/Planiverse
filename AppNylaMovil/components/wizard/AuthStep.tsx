/**
 * AuthStep - Componente para autenticación inicial (Paso 1 del wizard)
 * Feature: firebase-migration
 * 
 * Proporciona opciones de autenticación con Firebase:
 * - Login con Gmail (OAuth real con Firebase)
 * - Login con email/password
 * - Navegación a registro
 * 
 * Requisitos: 1.1-1.4
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthError, AuthErrorCode, UserRole, Theme } from '@/lib/auth/types';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';
import { MigrationService } from '@/lib/firebase/migration.service';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { FirestoreService } from '@/lib/firebase/firestore.service';
import { ThemeManager } from '@/lib/auth/services/ThemeManager';
import { AuthService } from '@/lib/firebase/auth.service';

interface AuthStepProps {
  onAuthSuccess: (userId: string, isNewUser: boolean) => void;
  onNavigateToRegister: () => void;
  onError?: (error: AuthError) => void;
}

interface ProfileData {
  role?: string;
  fullName?: string;
  nickname?: string;
  age?: number;
  theme?: string;
  selectedModules?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function AuthStep({ 
  onAuthSuccess, 
  onNavigateToRegister,
  onError 
}: AuthStepProps) {
  const router = useRouter();
  const { user, error: authError, login, loginWithGoogle } = useFirebaseAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const hasProcessedAuthRef = useRef(false);

  /**
   * Maneja el éxito de autenticación
   */
  const handleAuthSuccess = useCallback(async (userId: string) => {
    try {
      hasProcessedAuthRef.current = true;

      // Crear sesión en localStorage para compatibilidad con dashboard
      LocalStorageManager.saveSession({
        userId: userId,
        token: userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Verificar si el perfil existe en Firestore
      let profileData: ProfileData | null = null;
      try {
        profileData = await FirestoreService.read<ProfileData>('profile', 'data', userId);
      } catch {
        console.log('No se encontró perfil en Firestore, usuario nuevo');
      }

      // Si hay perfil en Firestore, guardarlo en localStorage y redirigir al dashboard
      if (profileData && profileData.role && profileData.fullName) {
        console.log('✅ Perfil completo encontrado en Firestore:', profileData);
        
        // Obtener el rol y tema
        const userRole = profileData.role as UserRole;
        const themeRole = (profileData.theme || userRole) as UserRole;
        const theme: Theme = ThemeManager.getThemeForRole(themeRole);
        
        // Guardar perfil en localStorage
        LocalStorageManager.saveProfile({
          userId: userId,
          fullName: profileData.fullName,
          nickname: profileData.nickname || '',
          age: profileData.age || 0,
          role: userRole,
          theme: theme,
          selectedModules: profileData.selectedModules || [],
          createdAt: profileData.createdAt || new Date().toISOString(),
          updatedAt: profileData.updatedAt || new Date().toISOString(),
        });
        
        // Guardar rol y marcar onboarding como completo
        localStorage.setItem('planiverse_role', profileData.role);
        localStorage.setItem('planiverse_onboarding_done', 'true');
        
        // Aplicar tema inmediatamente en el DOM (antes de navegar)
        ThemeManager.applyTheme(theme);
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-primary-hover', theme.colors.primaryHover || theme.colors.primary);
        root.style.setProperty('--color-primary-active', theme.colors.primaryActive || theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-background', theme.colors.background);
        root.style.setProperty('--color-text', theme.colors.text);
        root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
        root.setAttribute('data-theme', userRole);
        
        // Redirigir al dashboard
        console.log('✅ Redirigiendo a dashboard');
        router.push('/dashboard');
        return;
      }

      // Verificar si hay datos en localStorage para migrar
      const hasLocalData = MigrationService.hasLocalStorageData(userId);
      
      if (hasLocalData) {
        console.log('🔄 Detectados datos en localStorage, iniciando migración...');
        const migrationResult = await MigrationService.migrateUserData(userId);
        
        if (migrationResult.success) {
          console.log('✅ Migración completada exitosamente');
        } else {
          console.warn('⚠️ Migración parcial:', migrationResult.errors);
        }
      }

      // Usuario nuevo o perfil incompleto - continuar con el wizard
      const isNewUser = !profileData;
      
      console.log('🔄 Usuario nuevo o perfil incompleto, continuando wizard:', { userId, isNewUser });
      onAuthSuccess(userId, isNewUser);
    } catch (error) {
      console.error('❌ Error en handleAuthSuccess:', error);
      setLocalError('Error al procesar autenticación');
      hasProcessedAuthRef.current = false;
      setIsLoading(false);
    }
  }, [router, onAuthSuccess]);

  /**
   * Efecto para manejar cambios en el usuario autenticado
   */
  useEffect(() => {
    if (user && !hasProcessedAuthRef.current) {
      // Usar setTimeout para evitar setState durante render
      const timer = setTimeout(() => {
        handleAuthSuccess(user.uid);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [user, handleAuthSuccess]);

  /**
   * Efecto para manejar errores de autenticación
   */
  useEffect(() => {
    if (authError && !hasProcessedAuthRef.current) {
      // Usar setTimeout para evitar setState durante render
      const timer = setTimeout(() => {
        setLocalError(authError.message);
        setIsLoading(false);
        if (onError) {
          onError({
            code: authError.code as AuthErrorCode,
            message: authError.message
          });
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [authError, onError]);

  /**
   * Maneja el click en el botón de Gmail
   */
  const handleGoogleLoginClick = async () => {
    if (hasProcessedAuthRef.current || isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      
      await loginWithGoogle();
    } catch {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el login con email/password
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasProcessedAuthRef.current || isLoading) return;
    
    if (!email || !password) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);

      await login(email, password);
    } catch {
      setIsLoading(false);
    }
  };

  /**
   * Muestra el formulario de email/password
   */
  const handleShowEmailForm = () => {
    setShowEmailForm(true);
    setLocalError(null);
  };

  /**
   * Navega al paso de registro
   */
  const handleNavigateToRegister = () => {
    setLocalError(null);
    onNavigateToRegister();
  };

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setLocalError('Ingresa tu correo electrónico');
      return;
    }
    setIsLoading(true);
    setLocalError(null);
    const result = await AuthService.resetPassword(resetEmail);
    setIsLoading(false);
    if (result.success) {
      setResetMessage('✅ Correo enviado. Revisa tu bandeja de entrada (y spam).');
    } else {
      setLocalError(result.error || 'Error al enviar el correo');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bienvenido a Planiverse
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Mensaje de error */}
        {localError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-sm text-red-800">{localError}</p>
          </div>
        )}

        {showResetForm ? (
          /* Formulario de recuperación de contraseña */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-gray-600">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            </div>
            {resetMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{resetMessage}</p>
              </div>
            )}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
              <p className="text-xs text-blue-700">💡 Si iniciaste sesión con Google, no necesitas contraseña. El restablecimiento solo aplica para cuentas con correo y contraseña.</p>
            </div>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !!resetMessage}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Enviando...' : 'Enviar correo de recuperación'}
            </button>
            <button
              type="button"
              onClick={() => { setShowResetForm(false); setResetMessage(null); setLocalError(null); }}
              disabled={isLoading}
              className="w-full px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:underline disabled:opacity-50"
            >
              ← Volver
            </button>
          </form>
        ) : !showEmailForm ? (
          /* Vista inicial con botones de autenticación */
          <div className="space-y-4">
            {/* Botón de Gmail */}
            <button
              type="button"
              onClick={handleGoogleLoginClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Iniciar sesión con Gmail"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Autenticando...' : 'Iniciar sesión con Gmail'}
            </button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Botón de email */}
            <button
              type="button"
              onClick={handleShowEmailForm}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Iniciar sesión con Email
            </button>

            {/* Link a registro */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={handleNavigateToRegister}
                  disabled={isLoading}
                  className="text-blue-600 font-medium hover:text-blue-700 hover:underline focus:outline-none focus:underline disabled:opacity-50"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Formulario de email/password */
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            {/* Link recuperar contraseña */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setShowResetForm(true); setShowEmailForm(false); setLocalError(null); }}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              disabled={isLoading}
              className="w-full px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:underline disabled:opacity-50"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
