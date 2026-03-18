/**
 * RoleSelectionStep - Componente para selección de rol (Paso 4 del wizard)
 * Feature: user-authentication-profiles
 * 
 * Permite a los usuarios seleccionar su rol (Estudiante, Maestro u Otro) con vista previa
 * de esquemas de colores. Aplica el tema temporalmente al seleccionar y persiste en el perfil.
 * 
 * Requisitos: 5.1-5.5, 6.1-6.6, 11.1-11.3, 14.1-14.6
 */

'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/auth/types';
import { FirestoreService } from '@/lib/firebase/firestore.service';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { ThemeManager } from '@/lib/auth/services/ThemeManager';
import { THEMES } from '@/lib/auth/constants';

interface RoleSelectionStepProps {
  userId: string;
  onComplete: (role: UserRole) => void;
  onBack: () => void;
}

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'student',
    title: 'Estudiante',
    description: 'Aprendo y exploro nuevos conocimientos',
    icon: '🎓',
  },
  {
    role: 'teacher',
    title: 'Maestro',
    description: 'Enseño y guío a otros en su aprendizaje',
    icon: '👨‍🏫',
  },
  {
    role: 'other',
    title: 'Otro',
    description: 'Tengo un rol diferente o múltiple',
    icon: '✨',
  },
];

export default function RoleSelectionStep({
  userId,
  onComplete,
  onBack
}: RoleSelectionStepProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

interface ProfileData {
  role?: string;
  theme?: string;
  fullName?: string;
  nickname?: string;
  age?: number;
  selectedModules?: string[];
  createdAt?: string;
  updatedAt?: string;
}

  // Cargar rol existente del perfil si existe
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      try {
        const profileData = await FirestoreService.read<ProfileData>('profile', 'data', userId);
        if (profileData && profileData.role) {
          setSelectedRole(profileData.role as UserRole);
          // Aplicar tema del rol guardado
          if (profileData.theme) {
            const theme = ThemeManager.getThemeForRole(profileData.theme as UserRole);
            ThemeManager.applyTheme(theme);
          }
        }
      } catch (error) {
        console.error('Error al cargar rol del perfil:', error);
        // No mostrar error, simplemente no cargar datos previos
      }
    };
    
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  /**
   * Maneja la selección de un rol
   * Aplica el tema temporalmente para vista previa
   */
  const handleRoleSelect = (role: UserRole) => {
    try {
      setSelectedRole(role);
      setLocalError(null);
      
      // Obtener y aplicar tema del rol seleccionado
      const theme = ThemeManager.getThemeForRole(role);
      ThemeManager.applyTheme(theme);
    } catch (error) {
      console.error('Error al aplicar tema:', error);
      setLocalError('Error al aplicar el tema. Por favor, intenta nuevamente.');
    }
  };

  /**
   * Maneja el envío del formulario de selección de rol
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setLocalError(null);

    // Validar que se haya seleccionado un rol
    if (!selectedRole) {
      setLocalError('Por favor, selecciona un rol para continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener perfil existente de Firestore
      const existingProfile = await FirestoreService.read<ProfileData>('profile', 'data', userId);
      
      if (!existingProfile) {
        setLocalError('Error: No se encontró el perfil de usuario');
        setIsSubmitting(false);
        return;
      }

      // Obtener tema para el rol seleccionado
      const theme = ThemeManager.getThemeForRole(selectedRole);

      // Actualizar perfil con rol y tema
      const updatedProfile = {
        ...existingProfile,
        role: selectedRole,
        theme: theme,
      };

      // Guardar perfil actualizado en Firestore
      await FirestoreService.update('profile', 'data', updatedProfile, userId);
      
      // IMPORTANTE: También guardar en localStorage para compatibilidad con WizardContainer
      LocalStorageManager.saveProfile({
        userId: userId,
        fullName: existingProfile.fullName || '',
        nickname: existingProfile.nickname || '',
        age: existingProfile.age || 0,
        role: selectedRole,
        theme: theme,
        selectedModules: existingProfile.selectedModules || [],
        createdAt: existingProfile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Guardar rol en localStorage simple para acceso rápido
      localStorage.setItem('planiverse_role', selectedRole);
      
      // Marcar onboarding como completo
      localStorage.setItem('planiverse_onboarding_done', 'true');
      
      console.log('Role saved successfully, calling onComplete with role:', selectedRole);
      
      // Notificar éxito
      onComplete(selectedRole);
    } catch (error) {
      console.error('Error al guardar rol:', error);
      setLocalError('Error al guardar el rol. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Maneja el botón de volver
   */
  const handleBackClick = () => {
    setLocalError(null);
    onBack();
  };

  // Determinar si el botón de siguiente debe estar deshabilitado
  const isNextDisabled = isSubmitting || !selectedRole;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Selecciona tu rol
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Elige el rol que mejor te describe. Esto personalizará tu experiencia visual.
          </p>
        </div>

        {/* Mensaje de error general */}
        {localError && (
          <div
            role="alert"
            aria-live="assertive"
            id="role-error"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-sm text-red-800">{localError}</p>
          </div>
        )}

        {/* Formulario de selección de rol */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Opciones de rol */}
          <div
            role="radiogroup"
            aria-label="Selecciona tu rol"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {ROLE_OPTIONS.map((option) => {
              const theme = THEMES[option.role];
              const isSelected = selectedRole === option.role;

              return (
                <button
                  key={option.role}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${option.title}: ${option.description}`}
                  onClick={() => handleRoleSelect(option.role)}
                  disabled={isSubmitting}
                  className={`
                    relative p-6 rounded-lg border-2 transition-all duration-200
                    focus:outline-none focus:ring-4 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      isSelected
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-background)] shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                    }
                  `}
                  style={{
                    ...(isSelected && {
                      '--theme-primary': theme.colors.primary,
                      '--theme-background': theme.colors.background,
                    } as React.CSSProperties),
                  }}
                >
                  {/* Indicador de selección */}
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                      aria-hidden="true"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}

                  {/* Icono del rol */}
                  <div className="text-5xl mb-4 text-center" aria-hidden="true">
                    {option.icon}
                  </div>

                  {/* Título del rol */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {option.title}
                  </h3>

                  {/* Descripción del rol */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {option.description}
                  </p>

                  {/* Vista previa de colores */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 text-center">
                      Vista previa de colores
                    </p>
                    <div className="flex justify-center gap-2" aria-label="Paleta de colores">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.primary }}
                        title={`Color primario: ${theme.colors.primary}`}
                        aria-label={`Color primario: ${theme.colors.primary}`}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.secondary }}
                        title={`Color secundario: ${theme.colors.secondary}`}
                        aria-label={`Color secundario: ${theme.colors.secondary}`}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.accent }}
                        title={`Color de acento: ${theme.colors.accent}`}
                        aria-label={`Color de acento: ${theme.colors.accent}`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mensaje informativo */}
          {selectedRole && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 bg-blue-50 border border-blue-200 rounded-md"
            >
              <p className="text-sm text-blue-800 text-center">
                ✓ Has seleccionado el rol de{' '}
                <strong>
                  {ROLE_OPTIONS.find((opt) => opt.role === selectedRole)?.title}
                </strong>
                . El tema se ha aplicado temporalmente.
              </p>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            {/* Botón Atrás */}
            <button
              type="button"
              onClick={handleBackClick}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Volver al paso anterior"
            >
              Atrás
            </button>

            {/* Botón Siguiente */}
            <button
              type="submit"
              disabled={isNextDisabled}
              className="flex-1 px-4 py-3 bg-[var(--theme-primary)] text-white rounded-lg font-medium hover:bg-[var(--theme-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Guardar rol y continuar"
              aria-disabled={isNextDisabled}
            >
              {isSubmitting ? 'Guardando...' : 'Finalizar y entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
