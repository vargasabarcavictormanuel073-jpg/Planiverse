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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
