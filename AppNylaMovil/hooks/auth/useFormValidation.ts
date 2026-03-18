/**
 * useFormValidation - Hook para validación de formularios en tiempo real
 * Feature: user-authentication-profiles
 * 
 * Hook personalizado que proporciona validación de formularios con:
 * - Validación en tiempo real con debounce
 * - Gestión de campos touched
 * - Estado de validación global
 * - Integración con ValidationService
 * 
 * Requisitos: 10.1-10.5
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ValidationResult } from '@/lib/auth/types';

/**
 * Tipo de función validadora
 */
export type Validator<T = unknown> = (value: T) => ValidationResult;

/**
 * Configuración de validadores por campo
 */
export type ValidatorConfig<T> = {
  [K in keyof T]?: Validator<T[K]>;
};

/**
 * Tipo de retorno del hook useFormValidation
 */
export interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  reset: () => void;
  setValues: (values: T) => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
}

/**
 * Hook para validación de formularios con validación en tiempo real
 * 
 * @template T - Tipo del objeto de valores del formulario
 * @param initialValues - Valores iniciales del formulario
 * @param validators - Objeto con funciones validadoras por campo
 * @param debounceMs - Tiempo de debounce para validación (default: 300ms)
 * @returns Objeto con estado y funciones del formulario
 * 
 * @example
 * const { values, errors, handleChange, handleBlur, isValid } = useFormValidation(
 *   { email: '', password: '' },
 *   {
 *     email: ValidationService.validateEmail,
 *     password: ValidationService.validatePassword,
 *   }
 * );
 * 
 * // En el componente
 * <input
 *   value={values.email}
 *   onChange={(e) => handleChange('email', e.target.value)}
 *   onBlur={() => handleBlur('email')}
 * />
 * {errors.email && <span>{errors.email}</span>}
 */
export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validators: ValidatorConfig<T>,
  debounceMs: number = 300
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  // Refs para debounce
  const debounceTimers = useRef<Partial<Record<keyof T, NodeJS.Timeout>>>({});

  /**
   * Valida un campo específico
   */
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const validator = validators[field];
      
      if (!validator) {
        return true;
      }

      const value = values[field];
      const result = validator(value);

      if (!result.isValid && result.error) {
        setErrors(prev => ({ ...prev, [field]: result.error }));
        return false;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }
    },
    [values, validators]
  );

  /**
   * Valida todos los campos
   */
  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const field in validators) {
      const validator = validators[field as keyof T];
      if (!validator) continue;

      const value = values[field as keyof T];
      const result = validator(value);

      if (!result.isValid && result.error) {
        newErrors[field as keyof T] = result.error;
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    return isFormValid;
  }, [values, validators]);

  /**
   * Maneja cambios en los campos con debounce
   */
  const handleChange = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      // Actualizar valor inmediatamente
      setValues(prev => ({ ...prev, [field]: value }));

      // Limpiar timer anterior si existe
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }

      // Validar después del debounce solo si el campo ha sido touched
      if (touched[field]) {
        debounceTimers.current[field] = setTimeout(() => {
          const validator = validators[field];
          if (!validator) return;

          const result = validator(value);

          if (!result.isValid && result.error) {
            setErrors(prev => ({ ...prev, [field]: result.error }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
          }
        }, debounceMs);
      }
    },
    [validators, touched, debounceMs]
  );

  /**
   * Maneja blur en los campos (marca como touched y valida)
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      // Marcar campo como touched
      setTouched(prev => ({ ...prev, [field]: true }));

      // Validar inmediatamente al hacer blur
      const validator = validators[field];
      if (!validator) return;

      const value = values[field];
      const result = validator(value);

      if (!result.isValid && result.error) {
        setErrors(prev => ({ ...prev, [field]: result.error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [values, validators]
  );

  /**
   * Resetea el formulario a valores iniciales
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    
    // Limpiar todos los timers
    Object.values(debounceTimers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    debounceTimers.current = {};
  }, [initialValues]);

  /**
   * Establece todos los valores del formulario
   */
  const setFormValues = useCallback((newValues: T) => {
    setValues(newValues);
  }, []);

  /**
   * Establece el valor de un campo específico
   */
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Establece un error manualmente en un campo
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Calcula si el formulario es válido
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * Limpia timers al desmontar
   */
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    reset,
    setValues: setFormValues,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
  };
}
