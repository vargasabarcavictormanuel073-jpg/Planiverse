/**
 * WizardContainer - Componente orquestador del flujo completo del wizard
 * Feature: user-authentication-profiles
 * 
 * Gestiona el estado global del wizard de 4 pasos, navegación entre pasos,
 * verificación de sesión, persistencia de progreso y aplicación de temas dinámicos.
 * 
 * Flujo del wizard:
 * 1. AuthStep - Autenticación (Gmail OAuth o email/password)
 * 2. RegisterStep - Registro de nuevos usuarios (solo si es necesario)
 * 3. UserDataStep - Recopilación de datos personales
 * 4. RoleSelectionStep - Selección de rol con temas visuales
 
 * Requisitos: 8.1-8.5, 11.1-11.5, 12.1-12.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WizardStep, WizardProgress, UserData, UserRole } from '@/lib/auth/types';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { ThemeManager } from '@/lib/auth/services/ThemeManager';
import StepIndicator from '../ui/IndicadorProgresoPasos';
import AuthStep from './PasoInicioSesion';
import RegisterStep from './PasoRegistro';
import UserDataStep from './PasoDatosUsuario';
import RoleSelectionStep from './PasoSeleccionarRol';

interface WizardContainerProps {
  initialStep?: WizardStep;
}

export default function WizardContainer({ initialStep = 1 }: WizardContainerProps) {
  const router = useRouter();
  
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  /**
   * Verifica sesión existente al cargar el componente
   * Si hay sesión válida, redirige al dashboard
   * Si hay progreso guardado, restaura el estado del wizard
   */
  useEffect(() => {
    // Solo ejecutar una vez
    if (sessionChecked) return;
    
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Verificar si existe una sesión activa
        const session = LocalStorageManager.getSession();
        
        if (session) {
          // Validar que la sesión no esté expirada
          const isValid = new Date(session.expiresAt) > new Date();
          
          if (isValid) {
            // Sesión válida - verificar si el perfil está completo
            const profile = LocalStorageManager.getProfile(session.userId);
            const onboardingDone = localStorage.getItem('planiverse_onboarding_done') === 'true';
            
            if (profile && profile.role && profile.fullName && onboardingDone) {
              // Perfil completo - aplicar tema y redirigir al inicio
              ThemeManager.applyTheme(profile.theme);
              router.push('/inicio');
              return;
            } else {
              // Perfil incompleto - continuar wizard desde donde se quedó
              setUserId(session.userId);
              
              // Intentar cargar progreso guardado
              const savedProgress = loadWizardProgress(session.userId);
              if (savedProgress) {
                setCurrentStep(savedProgress.currentStep);
                setCompletedSteps(new Set(savedProgress.completedSteps));
              } else {
                // Si no hay progreso, ir al paso 3 (datos de usuario)
                setCurrentStep(3);
              }
            }
          } else {
            // Sesión expirada - limpiar y mostrar paso 1
            LocalStorageManager.clearSession();
            setCurrentStep(1);
          }
        } else {
          // No hay sesión - mostrar paso 1
          setCurrentStep(initialStep);
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
        setError('Error al cargar la sesión. Por favor, recarga la página.');
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [router, initialStep, sessionChecked]);

  /**
   * Carga el progreso del wizard desde localStorage
   */
  const loadWizardProgress = (userId: string): WizardProgress | null => {
    try {
      const progressData = localStorage.getItem('planiverse_wizard_progress');
      if (progressData) {
        const progress: WizardProgress = JSON.parse(progressData);
        if (progress.userId === userId) {
          return progress;
        }
      }
    } catch (err) {
      console.error('Error al cargar progreso del wizard:', err);
    }
    return null;
  };

  /**
   * Guarda el progreso del wizard en localStorage
   */
  const saveWizardProgress = useCallback((step: WizardStep, completed: Set<WizardStep>) => {
    if (!userId) return;

    try {
      const progress: WizardProgress = {
        userId,
        currentStep: step,
        completedSteps: Array.from(completed),
        tempData: {}, // Datos temporales si es necesario
      };
      
      localStorage.setItem('planiverse_wizard_progress', JSON.stringify(progress));
    } catch (err) {
      console.error('Error al guardar progreso del wizard:', err);
    }
  }, [userId]);

  /**
   * Limpia el progreso del wizard de localStorage
   */
  const clearWizardProgress = useCallback(() => {
    try {
      localStorage.removeItem('planiverse_wizard_progress');
    } catch (err) {
      console.error('Error al limpiar progreso del wizard:', err);
    }
  }, []);

  /**
   * Navega al siguiente paso del wizard
   */
  const goToNextStep = useCallback((nextStep: WizardStep) => {
    // Marcar paso actual como completado
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(currentStep);
    setCompletedSteps(newCompletedSteps);
    
    // Cambiar al siguiente paso
    setCurrentStep(nextStep);
    
    // Guardar progreso
    saveWizardProgress(nextStep, newCompletedSteps);
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, completedSteps, saveWizardProgress]);

  /**
   * Navega al paso anterior del wizard
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const previousStep = (currentStep - 1) as WizardStep;
      setCurrentStep(previousStep);
      
      // Guardar progreso
      saveWizardProgress(previousStep, completedSteps);
      
      // Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, completedSteps, saveWizardProgress]);

  /**
   * Maneja autenticación exitosa desde AuthStep
   */
  const handleAuthSuccess = useCallback((authenticatedUserId: string, isNewUser: boolean) => {
    setUserId(authenticatedUserId);
    setError(null);
    
    if (isNewUser) {
      // Usuario nuevo - ir directamente a paso 3 (datos de usuario)
      // Saltamos el paso 2 (registro) porque ya se creó la cuenta
      goToNextStep(3);
    } else {
      // Usuario existente - verificar perfil y redirigir al dashboard
      const profile = LocalStorageManager.getProfile(authenticatedUserId);
      if (profile && profile.role && profile.fullName) {
        // Perfil completo - aplicar tema y redirigir
        ThemeManager.applyTheme(profile.theme);
        clearWizardProgress();
        router.push('/inicio');
      } else {
        // Perfil incompleto - continuar wizard
        goToNextStep(3);
      }
    }
  }, [goToNextStep, clearWizardProgress, router]);

  /**
   * Maneja navegación a registro desde AuthStep
   */
  const handleNavigateToRegister = useCallback(() => {
    goToNextStep(2);
  }, [goToNextStep]);

  /**
   * Maneja registro exitoso desde RegisterStep
   */
  const handleRegisterSuccess = useCallback((registeredUserId: string) => {
    setUserId(registeredUserId);
    setError(null);
    goToNextStep(3);
  }, [goToNextStep]);

  /**
   * Maneja completación de datos de usuario desde UserDataStep
   */
  const handleUserDataComplete = useCallback((userData: UserData) => {
    setError(null);
    // Simplemente avanzar al siguiente paso sin verificaciones
    goToNextStep(4);
  }, [goToNextStep]);

  /**
   * Maneja selección de rol desde RoleSelectionStep
   */
  const handleRoleComplete = useCallback((role: UserRole) => {
    console.log('handleRoleComplete called with role:', role);
    setError(null);
    
    // Aplicar tema del rol seleccionado
    const theme = ThemeManager.getThemeForRole(role);
    ThemeManager.applyTheme(theme);
    
    // Limpiar progreso del wizard
    clearWizardProgress();
    
    // Redirigir al inicio
    console.log('Redirecting to inicio...');
    router.push('/inicio');
  }, [clearWizardProgress, router]);

  /**
   * Maneja errores de los pasos
   */
  const handleStepError = useCallback((error: { code: string; message: string }) => {
    setError(error.message);
    console.error('Error en paso del wizard:', error);
  }, []);

  /**
   * Renderiza el paso actual del wizard
   */
  const renderCurrentStep = () => {
    if (!userId && currentStep > 2) {
      // Si no hay userId y estamos más allá del paso 2, volver al paso 1
      setCurrentStep(1);
      return null;
    }

    switch (currentStep) {
      case 1:
        return (
          <AuthStep
            onAuthSuccess={handleAuthSuccess}
            onNavigateToRegister={handleNavigateToRegister}
            onError={handleStepError}
          />
        );
      
      case 2:
        return (
          <RegisterStep
            onRegisterSuccess={handleRegisterSuccess}
            onBack={goToPreviousStep}
            onError={handleStepError}
          />
        );
      
      case 3:
        return userId ? (
          <UserDataStep
            userId={userId}
            onComplete={handleUserDataComplete}
            onBack={goToPreviousStep}
          />
        ) : null;
      
      case 4:
        return userId ? (
          <RoleSelectionStep
            userId={userId}
            onComplete={handleRoleComplete}
            onBack={goToPreviousStep}
          />
        ) : null;
      
      
      default:
        return null;
    }
  };

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b4b] via-[#1a1060] to-[#2d1b69] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Fondo decorativo: elementos flotantes como en la imagen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Tarjeta checklist izquierda arriba */}
        <div className="absolute top-28 left-4 sm:left-8 w-36 h-28 bg-[#1a2a5e]/70 backdrop-blur-sm rounded-2xl border border-white/10 p-3 opacity-70">
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-yellow-400/60 flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div className="flex-1 h-2 bg-yellow-400/40 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta checklist izquierda abajo */}
        <div className="absolute bottom-28 left-4 sm:left-8 w-36 h-28 bg-[#1a2a5e]/70 backdrop-blur-sm rounded-2xl border border-white/10 p-3 opacity-70">
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-yellow-400/60 flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div className="flex-1 h-2 bg-yellow-400/40 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkmark grande derecha arriba */}
        <div className="absolute top-24 right-4 sm:right-12 opacity-40">
          <svg className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        {/* Tarjeta derecha medio */}
        <div className="absolute top-1/2 right-4 sm:right-8 -translate-y-1/2 w-28 h-24 bg-[#1a2a5e]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-3 opacity-60">
          <div className="space-y-2">
            {[1,2].map(i => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                <div className="flex-1 h-1.5 bg-purple-400/40 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkmark derecha abajo */}
        <div className="absolute bottom-24 right-4 sm:right-12 opacity-30">
          <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        {/* Líneas de gráfica izquierda */}
        <div className="absolute bottom-1/3 left-2 sm:left-6 opacity-25">
          <svg className="w-24 h-16" viewBox="0 0 100 60">
            <polyline points="0,50 20,35 40,40 60,20 80,25 100,10" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="0" cy="50" r="3" fill="#A78BFA"/>
            <circle cx="40" cy="40" r="3" fill="#A78BFA"/>
            <circle cx="80" cy="25" r="3" fill="#A78BFA"/>
          </svg>
        </div>

        {/* Líneas de gráfica derecha */}
        <div className="absolute top-1/3 right-2 sm:right-6 opacity-25">
          <svg className="w-20 h-14" viewBox="0 0 100 60">
            <polyline points="0,55 25,40 50,45 75,20 100,15" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="25" cy="40" r="3" fill="#60A5FA"/>
            <circle cx="75" cy="20" r="3" fill="#60A5FA"/>
          </svg>
        </div>

        {/* Hexágono decorativo */}
        <div className="absolute bottom-16 right-1/4 opacity-15">
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#A78BFA" strokeWidth="3"/>
          </svg>
        </div>

        {/* Círculo decorativo */}
        <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full bg-blue-400/30 border border-blue-300/30 opacity-60"></div>
        <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-yellow-400/40 opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Indicador de progreso */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={4}
        />

        {/* Mensaje de error global */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake"
          >
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Paso actual del wizard */}
        <div
          className="animate-fade-in"
          role="main"
          aria-label={`Paso ${currentStep} de 4`}
        >
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
