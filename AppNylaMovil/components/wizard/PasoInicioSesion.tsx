/**
 * AuthStep - Componente para autenticación inicial (Paso 1 del wizard)
 * Feature: firebase-migration
 *
 * Proporciona autenticación con Firebase usando Google OAuth y email/contraseña.
 * Incluye flujo completo de recuperación de contraseña.
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
import { AuthService } from '@/firebase/services/auth.service';
import PasswordInput from '@/components/ui/CampoEntradaContrasena';

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
  onError,
}: AuthStepProps) {
  const router = useRouter();
  const { user, error: authError, loginWithGoogle } = useFirebaseAuth();

  // Estado general
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasProcessedAuthRef = useRef(false);
  const loginAttemptedRef = useRef(false);

  // Estado login con email
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Estado recuperar contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [forgotError, setForgotError] = useState('');

  // ── Lógica de autenticación ──────────────────────────────────────────────

  const handleAuthSuccess = useCallback(
    async (userId: string) => {
      try {
        hasProcessedAuthRef.current = true;
        setIsLoading(true);

        LocalStorageManager.saveSession({
          userId,
          token: userId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // 1. Revisar localStorage primero
        const localProfile = LocalStorageManager.getProfile(userId);
        if (localProfile && localProfile.role && localProfile.fullName) {
          const theme: Theme = ThemeManager.getThemeForRole(localProfile.role as UserRole);
          ThemeManager.applyTheme(theme);
          localStorage.setItem('planiverse_onboarding_done', 'true');
          setTimeout(() => router.push('/inicio'), 100);
          return;
        }

        // 2. Intentar leer de Firestore
        try {
          const profileData = await FirestoreService.read<ProfileData>('profile', 'data', userId);
          if (profileData && profileData.role && profileData.fullName) {
            const userRole = profileData.role as UserRole;
            const themeRole = (profileData.theme || userRole) as UserRole;
            const theme: Theme = ThemeManager.getThemeForRole(themeRole);

            LocalStorageManager.saveProfile({
              userId,
              fullName: profileData.fullName,
              nickname: profileData.nickname || '',
              age: profileData.age || 0,
              role: userRole,
              theme,
              selectedModules: profileData.selectedModules || [],
              createdAt: profileData.createdAt || new Date().toISOString(),
              updatedAt: profileData.updatedAt || new Date().toISOString(),
            });

            localStorage.setItem('planiverse_role', profileData.role);
            localStorage.setItem('planiverse_onboarding_done', 'true');
            ThemeManager.applyTheme(theme);
            setTimeout(() => router.push('/inicio'), 100);
            return;
          }
        } catch (err) {
          console.error('Error leyendo de Firestore:', err);
        }

        // 3. Usuario nuevo o perfil incompleto → continuar wizard
        setIsLoading(false);
        onAuthSuccess(userId, true);
      } catch (error) {
        console.error('Error en handleAuthSuccess:', error);
        setLocalError('Error al procesar autenticación');
        hasProcessedAuthRef.current = false;
        setIsLoading(false);
      }
    },
    [router, onAuthSuccess]
  );

  useEffect(() => {
    if (user && !hasProcessedAuthRef.current && loginAttemptedRef.current) {
      const timer = setTimeout(() => handleAuthSuccess(user.uid), 0);
      return () => clearTimeout(timer);
    }
  }, [user, handleAuthSuccess]);

  useEffect(() => {
    if (authError && !hasProcessedAuthRef.current) {
      const timer = setTimeout(() => {
        setLocalError(authError.message);
        setIsLoading(false);
        if (onError) {
          onError({ code: authError.code as AuthErrorCode, message: authError.message });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [authError, onError]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleGoogleLoginClick = async () => {
    if (isLoading) return;
    hasProcessedAuthRef.current = false;
    loginAttemptedRef.current = true;
    try {
      setIsLoading(true);
      setLocalError(null);
      await loginWithGoogle();
    } catch {
      setIsLoading(false);
      setLocalError('Error al iniciar sesión con Google');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailLoading) return;
    hasProcessedAuthRef.current = false;
    loginAttemptedRef.current = true;
    setLocalError(null);
    setIsEmailLoading(true);
    try {
      const result = await AuthService.login(emailInput, passwordInput);
      if (!result.success) {
        const msg = result.error?.message || 'Credenciales incorrectas';
        const code = result.error?.code || '';
        // Si el error es invalid-credential, puede ser cuenta de Google sin contraseña
        if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
          setLocalError('Email o contraseña incorrectos. Si te registraste con Google, usa el botón de Google.');
        } else {
          setLocalError(msg);
        }
        hasProcessedAuthRef.current = false;
        loginAttemptedRef.current = false;
      }
      // Si tiene éxito, el useEffect de `user` dispara handleAuthSuccess
    } catch {
      setLocalError('Error al iniciar sesión');
      hasProcessedAuthRef.current = false;
      loginAttemptedRef.current = false;
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Ingresa tu correo electrónico');
      return;
    }
    setForgotStatus('loading');
    setForgotError('');
    const result = await AuthService.resetPassword(forgotEmail.trim());
    if (result.success) {
      setForgotStatus('sent');
    } else {
      setForgotStatus('error');
      setForgotError(result.error || 'No se pudo enviar el correo');
    }
  };

  const handleBackFromForgot = () => {
    setShowForgotPassword(false);
    setForgotStatus('idle');
    setForgotEmail('');
    setForgotError('');
  };

  // ── Vista: Recuperar contraseña ──────────────────────────────────────────

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10">
          {/* Botón volver */}
          <button
            onClick={handleBackFromForgot}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 bg-blue-900/40">
              🔑
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-400 text-sm">Te enviaremos un enlace para restablecerla</p>
          </div>

          {forgotStatus === 'sent' ? (
            /* ── Confirmación de envío ── */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-lg font-bold text-white mb-2">¡Correo enviado!</h3>
              <p className="text-gray-300 text-sm mb-2">
                Revisa tu bandeja en{' '}
                <span className="font-semibold text-blue-300">{forgotEmail}</span>
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Si no lo ves, revisa la carpeta de spam. El enlace expira en 1 hora.
              </p>
              <button
                onClick={handleBackFromForgot}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            /* ── Formulario de recuperación ── */
            <form onSubmit={handleForgotPassword} className="auth-form space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors border"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {forgotStatus === 'error' && (
                <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                  <p className="text-sm text-red-300">{forgotError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={forgotStatus === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {forgotStatus === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Vista principal: Login ───────────────────────────────────────────────

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mb-5 inline-block">
            <svg viewBox="0 0 120 140" className="w-24 h-28 drop-shadow-2xl" aria-hidden="true">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="50%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <text x="8" y="110" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="110" fill="url(#logoGrad)">P</text>
              <line x1="55" y1="85" x2="108" y2="20" stroke="url(#arrowGrad)" strokeWidth="7" strokeLinecap="round" />
              <polygon points="108,20 95,22 106,33" fill="#F59E0B" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-3 drop-shadow-lg leading-tight">
            Bienvenido a<br />Planiverse
          </h1>
          <p className="text-base text-gray-300">Tu espacio para organizar y alcanzar tus metas</p>
        </div>

        {/* Error general */}
        {localError && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-red-200">{localError}</p>
          </div>
        )}

        {/* Formulario email + contraseña */}
        <form onSubmit={handleEmailLogin} className="auth-form space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors border"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <PasswordInput
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full px-4 py-3 bg-slate-700/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* ¿Olvidaste tu contraseña? */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotEmail(emailInput);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isEmailLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isEmailLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">o continúa con</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleLoginClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/60 border border-white/10 rounded-xl text-white font-semibold hover:bg-slate-600/60 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Iniciar sesión con Google"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Autenticando...
            </span>
          ) : (
            'Continuar con Google'
          )}
        </button>

        {/* Centro de Ayuda */}
        <div className="mt-5 text-center">
          <a
            href="/ayuda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Centro de Ayuda
          </a>
        </div>

      </div>
    </div>
  );
}
