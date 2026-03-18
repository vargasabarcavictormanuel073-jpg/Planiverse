/**
 * UserDataStep - Componente para recopilación de datos personales (Paso 3 del wizard)
 * Feature: user-authentication-profiles
 * 
 * Permite a los usuarios ingresar su información personal: nombre completo, apodo y edad.
 * Incluye validación en tiempo real y persistencia de datos en el perfil de usuario.
 * 
 * Requisitos: 4.1-4.6, 10.1-10.5, 11.1-11.3, 14.1-14.6
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { ValidationService } from '@/lib/auth/services/ValidationService';
import { FirestoreService } from '@/lib/firebase/firestore.service';
import { MigrationService } from '@/lib/firebase/migration.service';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { UserData } from '@/lib/auth/types';

interface UserDataStepProps {
  userId: string;
  onComplete: (userData: UserData) => void;
  onBack: () => void;
}

interface UserDataFormValues extends Record<string, unknown> {
  fullName: string;
  nickname: string;
  age: string; // String para manejar input, se convierte a number en validación
}

export default function UserDataStep({
  userId,
  onComplete,
  onBack
}: UserDataStepProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Configurar validación del formulario PRIMERO (antes de cualquier useEffect que use setFieldValue)
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
  } = useFormValidation(
    {
      fullName: '',
      nickname: '',
      age: '',
    } as UserDataFormValues,
    {
      fullName: ValidationService.validateName as any,
      nickname: ValidationService.validateNickname as any,
      age: (value: unknown) => {
        // Validar que sea un número
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return { isValid: false, error: 'La edad es requerida' };
        }
        
        const ageNumber = parseInt(value, 10);
        if (isNaN(ageNumber)) {
          return { isValid: false, error: 'La edad debe ser un número válido' };
        }
        
        return ValidationService.validateAge(ageNumber);
      },
    }
  );

  // Cargar datos existentes del perfil si existen (DESPUÉS del hook para que setFieldValue esté disponible)
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      try {
        interface ProfileData {
          fullName?: string;
          nickname?: string;
          age?: number;
        }
        
        const profileData = await FirestoreService.read<ProfileData>('profile', 'data', userId);
        if (profileData) {
          setFieldValue('fullName', profileData.fullName || '');
          setFieldValue('nickname', profileData.nickname || '');
          setFieldValue('age', profileData.age?.toString() || '');
        }
      } catch (err) {
        console.error('Error al cargar datos del perfil:', err);
      }
    };
    
    if (userId) {
      loadProfile();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Maneja el envío del formulario de datos personales
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setLocalError(null);

    // Validar que todos los campos estén completos
    if (!values.fullName || !values.nickname || !values.age) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }

    // Validar que no haya errores de validación
    if (!isValid) {
      setLocalError('Por favor, corrige los errores antes de continuar');
      return;
    }

    // Convertir edad a número
    const ageNumber = parseInt(values.age, 10);
    if (isNaN(ageNumber)) {
      setLocalError('La edad debe ser un número válido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validar que tenemos userId
      if (!userId) {
        setLocalError('Error: No se pudo identificar el usuario. Por favor, intenta nuevamente.');
        return;
      }

      // Crear objeto UserData
      const userData: UserData = {
        fullName: values.fullName.trim(),
        nickname: values.nickname.trim(),
        age: ageNumber,
      };

      // Guardar perfil en Firestore usando setDoc directamente
      const profileData = {
        fullName: userData.fullName,
        nickname: userData.nickname,
        age: userData.age,
        role: 'student',
        selectedModules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // Llamar a update con el orden correcto: collectionName, docId, data, userId
        await FirestoreService.update('profile', 'data', profileData, userId);
        
        // IMPORTANTE: También guardar en localStorage para compatibilidad con WizardContainer
        LocalStorageManager.saveProfile({
          userId: userId,
          fullName: userData.fullName,
          nickname: userData.nickname,
          age: userData.age,
          role: 'student',
          theme: { name: 'student', colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#06B6D4', background: '#F3F4F6' } },
          selectedModules: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        const err = error as { message?: string };
        setLocalError(`Error al guardar los datos en Firebase: ${err.message || 'Error desconocido'}`);
        console.error('Firestore save error:', error);
        return;
      }

      // Verificar si hay datos en localStorage para migrar
      const hasLocalData = MigrationService.hasLocalStorageData();
      
      if (hasLocalData) {
        setIsMigrating(true);
        
        // Migrar datos automáticamente
        const migrationResult = await MigrationService.migrateUserData(userId);
        
        if (migrationResult.success) {
          console.log('Migración completada exitosamente');
        } else {
          console.warn('Migración parcial o fallida:', migrationResult.errors);
        }
        
        setIsMigrating(false);
      }
      
      // Notificar éxito
      onComplete(userData);
    } catch (err) {
      console.error('Error al procesar datos:', err);
      setLocalError('Error al procesar los datos. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
      setIsMigrating(false);
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
  const isNextDisabled = 
    isSubmitting || 
    isMigrating ||
    !values.fullName || 
    !values.nickname || 
    !values.age ||
    !isValid ||
    Object.keys(errors).length > 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Cuéntanos sobre ti
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Completa tu perfil con tu información personal
          </p>
        </div>

        {/* Mensaje de error general */}
        {localError && (
          <div
            role="alert"
            aria-live="assertive"
            id="userdata-error"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-sm text-red-800">{localError}</p>
          </div>
        )}

        {/* Indicador de migración */}
        {isMigrating && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
          >
            <p className="text-sm text-blue-800">Migrando tus datos a Firebase...</p>
          </div>
        )}

        {/* Formulario de datos personales */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Campo de nombre completo */}
          <div>
            <label
              htmlFor="userdata-fullname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo
            </label>
            <input
              type="text"
              id="userdata-fullname"
              name="fullName"
              value={values.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              disabled={isSubmitting}
              required
              autoComplete="name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal ${
                touched.fullName && errors.fullName
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Juan Pérez"
              aria-required="true"
              aria-invalid={touched.fullName && !!errors.fullName}
              aria-describedby={
                touched.fullName && errors.fullName ? 'fullname-error' : undefined
              }
            />
            {touched.fullName && errors.fullName && (
              <p
                id="fullname-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Campo de apodo */}
          <div>
            <label
              htmlFor="userdata-nickname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Apodo
            </label>
            <input
              type="text"
              id="userdata-nickname"
              name="nickname"
              value={values.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              onBlur={() => handleBlur('nickname')}
              disabled={isSubmitting}
              required
              autoComplete="nickname"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal ${
                touched.nickname && errors.nickname
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Juanito"
              aria-required="true"
              aria-invalid={touched.nickname && !!errors.nickname}
              aria-describedby={
                touched.nickname && errors.nickname ? 'nickname-error' : undefined
              }
            />
            {touched.nickname && errors.nickname && (
              <p
                id="nickname-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.nickname}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Entre 2 y 20 caracteres
            </p>
          </div>

          {/* Campo de edad */}
          <div>
            <label
              htmlFor="userdata-age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Edad
            </label>
            <input
              type="number"
              id="userdata-age"
              name="age"
              value={values.age}
              onChange={(e) => handleChange('age', e.target.value)}
              onBlur={() => handleBlur('age')}
              disabled={isSubmitting}
              required
              min="5"
              max="120"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal ${
                touched.age && errors.age
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="25"
              aria-required="true"
              aria-invalid={touched.age && !!errors.age}
              aria-describedby={
                touched.age && errors.age ? 'age-error' : undefined
              }
            />
            {touched.age && errors.age && (
              <p
                id="age-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.age}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Entre 5 y 120 años
            </p>
          </div>

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
              aria-label="Guardar datos y continuar"
              aria-disabled={isNextDisabled}
            >
              {isMigrating ? 'Migrando datos...' : isSubmitting ? 'Guardando...' : 'Siguiente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
