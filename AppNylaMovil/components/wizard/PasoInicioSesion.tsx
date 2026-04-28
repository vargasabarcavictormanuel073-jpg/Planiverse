/**
 * AuthStep - Componente para autenticación inicial (Paso 1 del wizard)
 * Feature: firebase-migration
 * 
 * Proporciona autenticación con Firebase usando Google OAuth
 * 
 * Requisitos: 1.1-1.4
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthError, AuthErrorCode, UserRole, Theme } from '@/lib/auth/types';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { FirestoreService } from '@/firebase/services/firestore.service';
import { ThemeManager } from '@/lib/auth/services/ThemeManager';

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
  const { user, error: authError, loginWithGoogle } = useFirebaseAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasProcessedAuthRef = useRef(false);
  const loginAttemptedRef = useRef(false);

  /**
   * Maneja el éxito de autenticación
   */
  const handleAuthSuccess = useCallback(async (userId: string) => {
    try {
      hasProcessedAuthRef.current = true;
      setIsLoading(true);
      console.log('🎯 handleAuthSuccess llamado con userId:', userId);

      // Crear sesión en localStorage
      LocalStorageManager.saveSession({
        userId: userId,
        token: userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      console.log('✅ Sesión guardada en localStorage');

      // 1. Revisar localStorage PRIMERO (instantáneo, sin red)
      const localProfile = LocalStorageManager.getProfile(userId);
      console.log('📦 Perfil en localStorage:', localProfile);

      if (localProfile && localProfile.role && localProfile.fullName) {
        console.log('✅ Perfil completo encontrado en localStorage, redirigiendo a /inicio');
        const theme: Theme = ThemeManager.getThemeForRole(localProfile.role as UserRole);
        ThemeManager.applyTheme(theme);
        localStorage.setItem('planiverse_onboarding_done', 'true');
        
        setTimeout(() => {
          router.push('/inicio');
        }, 100);
        return;
      }

      // 2. Sin datos locales — intentar leer de Firestore
      console.log('📡 No hay datos locales, intentando leer de Firestore...');
      try {
        const profileData = await FirestoreService.read<ProfileData>('profile', 'data', userId);
        console.log('📡 Respuesta de Firestore:', profileData);
        
        if (profileData && profileData.role && profileData.fullName) {
          console.log('✅ Perfil completo encontrado en Firestore');
          
          const userRole = profileData.role as UserRole;
          const themeRole = (profileData.theme || userRole) as UserRole;
          const theme: Theme = ThemeManager.getThemeForRole(themeRole);

          // Guardar en localStorage
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

          localStorage.setItem('planiverse_role', profileData.role);
          localStorage.setItem('planiverse_onboarding_done', 'true');

          // Aplicar tema
          ThemeManager.applyTheme(theme);

          console.log('✅ Perfil sincronizado, redirigiendo a /inicio');
          setTimeout(() => {
            router.push('/inicio');
          }, 100);
          return;
        } else {
          console.log('⚠️ Perfil incompleto en Firestore');
        }
      } catch (err) {
        console.error('❌ Error leyendo de Firestore:', err);
      }

      // 3. Usuario nuevo o perfil incompleto, continuar con wizard
      console.log('🔄 Usuario nuevo o perfil incompleto, continuando con wizard');
      console.log('🔄 Llamando onAuthSuccess(userId, true)');
      setIsLoading(false);
      onAuthSuccess(userId, true);
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
    if (user && !hasProcessedAuthRef.current && loginAttemptedRef.current) {
      console.log('🔄 Usuario autenticado detectado, procesando...', user.uid);
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
      const timer = setTimeout(() => {
        console.error('❌ Error de autenticación:', authError);
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
    if (isLoading) return;
    hasProcessedAuthRef.current = false;
    loginAttemptedRef.current = true;
    try {
      setIsLoading(true);
      setLocalError(null);
      console.log('🔐 Intentando login con Google...');
      await loginWithGoogle();
      console.log('✅ Login con Google exitoso, esperando procesamiento...');
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      setIsLoading(false);
      setLocalError('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-700/80 via-purple-900/80 to-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10">
        {/* Logo/Icono */}
        <div className="text-center mb-6">
          <div className="mb-6 inline-block">
            <div className="w-32 h-32 flex items-center justify-center">
              {/* Icono isométrico simplificado */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Cubo base en dorado */}
                <path d="M100 40 L160 70 L160 130 L100 160 L40 130 L40 70 Z" 
                      fill="none" stroke="#F59E0B" strokeWidth="4" opacity="0.8"/>
                <path d="M100 40 L100 100 M100 100 L160 130 M100 100 L40 130" 
                      stroke="#F59E0B" strokeWidth="4" opacity="0.6"/>
                
                {/* Flecha en cyan */}
                <path d="M120 80 L160 60 L160 100 L140 110" 
                      fill="none" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M160 60 L150 50 M160 60 L170 50" 
                      stroke="#06B6D4" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-3 drop-shadow-lg">
            Bienvenido a<br/>Planiverse
          </h1>
          <p className="text-base text-gray-200">
            Tu espacio para organizar y alcanzar tus metas
          </p>
        </div>

        {/* Mensaje de error */}
        {localError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg animate-shake backdrop-blur-sm"
          >
            <p className="text-sm text-red-200">{localError}</p>
          </div>
        )}

        {/* Botón de Google con gradiente */}
        <button
          type="button"
          onClick={handleGoogleLoginClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 rounded-2xl text-white font-bold text-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          aria-label="Iniciar sesión con Gmail"
        >
          <svg className="w-7 h-7 bg-white rounded-full p-1" viewBox="0 0 24 24" aria-hidden="true">
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
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Autenticando...
            </span>
          ) : (
            'Continuar con Google'
          )}
        </button>
      </div>
    </div>
  );
}
