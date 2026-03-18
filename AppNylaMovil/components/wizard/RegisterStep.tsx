/**
 * RegisterStep - Componente para registro de nuevos usuarios (Paso 2 del wizard)
 * Feature: firebase-migration
 * 
 * Permite a nuevos usuarios registrarse con email y contraseña usando Firebase.
 * Incluye validación en tiempo real y manejo de errores de Firebase.
 * 
 * Requisitos: 1.1
 */

'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { ValidationService } from '@/lib/auth/services/ValidationService';
import { AuthError } from '@/lib/auth/types';

interface RegisterStepProps {
  onRegisterSuccess: (userId: string) => void;
  onBack: () => void;
  onError?: (error: AuthError) => void;
}

interface RegisterFormValues extends Record<string, unknown> {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterStep({
  onRegisterSuccess,
  onBack,
  onError
}: RegisterStepProps) {
  const { user, error: authError, register } = useFirebaseAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const hasRegisteredRef = useRef(false);

  // Configurar validación del formulario
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
  } = useFormValidation(
    {
      email: '',
      password: '',
      confirmPassword: '',
    } as RegisterFormValues,
    {
      email: ValidationService.validateEmail as any,
      password: ValidationService.validatePassword as any,
      confirmPassword: (value: unknown) => {
        if (!value || typeof value !== 'string') {
          return { isValid: false, error: 'La confirmación de contraseña es requerida' };
        }
        return ValidationService.validatePasswordMatch(passwordValue, value);
      },
    }
  );

  // Actualizar passwordValue cuando cambie el campo password
  useEffect(() => {
    // Usar setTimeout para evitar setState durante render
    const timer = setTimeout(() => {
      setPasswordValue(values.password);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [values.password]);

  // Manejar cuando el usuario se registra exitosamente
  useEffect(() => {
    if (user && isLoading && !hasRegisteredRef.current) {
      hasRegisteredRef.current = true;
      // Usar setTimeout para evitar setState durante render
      const timer = setTimeout(() => {
        console.log('✅ Usuario registrado exitosamente:', user.uid);
        onRegisterSuccess(user.uid);
        setIsLoading(false);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, onRegisterSuccess]);

  // Manejar errores de autenticación
  useEffect(() => {
    if (authError && !hasRegisteredRef.current) {
      // Usar setTimeout para evitar setState durante render
      const timer = setTimeout(() => {
        setLocalError(authError.message);
        setIsLoading(false);
        if (onError) {
          onError(authError as import('@/lib/auth/types').AuthError);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [authError, onError]);

  /**
   * Maneja el envío del formulario de registro
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setLocalError(null);

    // Validar que todos los campos estén completos
    if (!values.email || !values.password || !values.confirmPassword) {
      setLocalError('Por favor, completa todos los campos');
      return;
    }

    // Validar que el formulario sea válido
    if (!isValid) {
      setLocalError('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Iniciando registro con Firebase...');
      
      // Registrar usuario con Firebase
      await register(values.email, values.password);
      
      // El éxito se maneja en el useEffect que escucha cambios en 'user'
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setLocalError('Error al registrar usuario');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-600">
            Regístrate para comenzar tu experiencia
          </p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {localError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📧 Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                touched.email && errors.email
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 focus:border-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {touched.email && errors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔒 Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="Mínimo 6 caracteres"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                touched.password && errors.password
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 focus:border-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {touched.password && errors.password && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔒 Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="Repite tu contraseña"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                touched.confirmPassword && errors.confirmPassword
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 focus:border-blue-500'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Registrando...
              </span>
            ) : (
              '✨ Crear Cuenta'
            )}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Volver
          </button>
        </form>
      </div>
    </div>
  );
}
