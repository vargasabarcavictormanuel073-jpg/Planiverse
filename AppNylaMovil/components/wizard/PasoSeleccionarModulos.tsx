/**
 * ModuleSelectionStep - Componente para selección de módulos (Paso 5 del wizard)
 * Feature: user-authentication-profiles
 * 
 * Permite a los usuarios seleccionar módulos (Tareas, Calendario, Rutinas, Notas, Recordatorios)
 * con el tema aplicado del rol seleccionado. Finaliza el wizard guardando la configuración
 * completa en localStorage y redirigiendo al dashboard.
 * 
 * Requisitos: 7.1-7.5, 11.1-11.3, 14.1-14.6
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModuleCard from '../ui/TarjetaSeleccionModulo';
import { ModuleType, AVAILABLE_MODULES } from '@/types/components';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { ThemeManager } from '@/lib/auth/services/ThemeManager';

interface ModuleSelectionStepProps {
  userId: string;
  onBack: () => void;
}

export default function ModuleSelectionStep({
  userId,
  onBack
}: ModuleSelectionStepProps) {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar selectedModules desde el perfil existente
  const [selectedModules, setSelectedModules] = useState<Set<ModuleType>>(() => {
    try {
      const existingProfile = LocalStorageManager.getProfile(userId);
      if (existingProfile && existingProfile.selectedModules) {
        return new Set(existingProfile.selectedModules as ModuleType[]);
      }
    } catch (error) {
      console.error('Error al cargar módulos del perfil:', error);
    }
    return new Set();
  });

  // Aplicar tema del perfil si existe
  useEffect(() => {
    try {
      const existingProfile = LocalStorageManager.getProfile(userId);
      if (existingProfile && existingProfile.theme) {
        ThemeManager.applyTheme(existingProfile.theme);
      }
    } catch (error) {
      console.error('Error al aplicar tema:', error);
    }
  }, [userId]);

  /**
   * Maneja la selección/deselección de módulos
   */
  const handleModuleToggle = useCallback((module: ModuleType) => {
    // Validación defensiva: verificar que el módulo existe en AVAILABLE_MODULES
    if (!AVAILABLE_MODULES.find(m => m.id === module)) {
      console.error('Intento de toggle de módulo no reconocido:', module);
      return;
    }

    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
    
    // Limpiar errores al interactuar
    setLocalError(null);
  }, []);

  /**
   * Maneja el botón de volver
   */
  const handleBackClick = () => {
    setLocalError(null);
    onBack();
  };

  /**
   * Finaliza el wizard guardando toda la configuración y redirigiendo al dashboard
   */
  const handleFinish = async () => {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      // Obtener perfil existente
      const existingProfile = LocalStorageManager.getProfile(userId);
      
      if (!existingProfile) {
        setLocalError('Error: No se encontró el perfil de usuario');
        setIsSubmitting(false);
        return;
      }

      // Convertir Set a Array para almacenamiento
      const modulesArray = Array.from(selectedModules);

      // Actualizar perfil con módulos seleccionados
      const updatedProfile = {
        ...existingProfile,
        selectedModules: modulesArray,
        updatedAt: new Date().toISOString(),
      };

      // Guardar perfil actualizado en localStorage
      LocalStorageManager.saveProfile(updatedProfile);

      // Obtener sesión actual
      const session = LocalStorageManager.getSession();
      
      if (!session) {
        setLocalError('Error: No se encontró la sesión activa');
        setIsSubmitting(false);
        return;
      }

      // Actualizar lastLogin del usuario
      const user = LocalStorageManager.getUser(userId);
      if (user) {
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
        };
        LocalStorageManager.saveUser(updatedUser);
      }

      // Redirigir al inicio
      router.push('/inicio');
    } catch (error) {
      console.error('Error al finalizar wizard:', error);
      setLocalError('Error al guardar la configuración. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Selecciona tus módulos
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Elige las herramientas que necesitas para tu organización personal
          </p>
        </div>

        {/* Mensaje de error general */}
        {localError && (
          <div
            role="alert"
            aria-live="assertive"
            id="module-error"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-sm text-red-800">{localError}</p>
          </div>
        )}

        {/* Grid de módulos */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8"
          role="group"
          aria-label="Módulos disponibles"
          aria-describedby="module-selection-help"
        >
          {AVAILABLE_MODULES.map((module, index) => (
            <div 
              key={module.id}
              className="animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <ModuleCard
                module={module}
                isSelected={selectedModules.has(module.id)}
                onToggle={handleModuleToggle}
              />
            </div>
          ))}
        </div>
        
        {/* Texto de ayuda para lectores de pantalla */}
        <div id="module-selection-help" className="sr-only">
          Selecciona los módulos que deseas activar. Puedes seleccionar múltiples módulos. 
          Actualmente tienes {selectedModules.size} módulo{selectedModules.size !== 1 ? 's' : ''} seleccionado{selectedModules.size !== 1 ? 's' : ''}.
        </div>

        {/* Mensaje informativo */}
        {selectedModules.size > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md"
          >
            <p className="text-sm text-blue-800 text-center">
              ✓ Has seleccionado {selectedModules.size} módulo{selectedModules.size !== 1 ? 's' : ''}
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

          {/* Botón Crear mi Planiverse */}
          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Crear mi Planiverse y finalizar configuración"
          >
            {isSubmitting ? 'Guardando...' : 'Crear mi Planiverse'}
          </button>
        </div>
      </div>
    </div>
  );
}
