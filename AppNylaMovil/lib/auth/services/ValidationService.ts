/**
 * Servicio de validación para formularios de autenticación y perfiles
 * Feature: user-authentication-profiles
 */

import { ValidationResult } from '../types';
import { VALIDATION_RULES } from '../constants';

/**
 * Valida el formato de un email
 * @param email - Email a validar
 * @returns ValidationResult con isValid y error opcional
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El email es requerido'
    };
  }

  // Regex para validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'El formato del email no es válido'
    };
  }

  return { isValid: true };
}

/**
 * Valida la fortaleza de una contraseña
 * @param password - Contraseña a validar
 * @returns ValidationResult con isValid y error opcional
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'La contraseña es requerida'
    };
  }

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`
    };
  }

  return { isValid: true };
}

/**
 * Valida que dos contraseñas coincidan
 * @param password - Contraseña original
 * @param confirmPassword - Contraseña de confirmación
 * @returns ValidationResult con isValid y error opcional
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden'
    };
  }

  return { isValid: true };
}

/**
 * Valida que un nombre no esté vacío
 * @param name - Nombre a validar
 * @returns ValidationResult con isValid y error opcional
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'El nombre es requerido'
    };
  }

  return { isValid: true };
}

/**
 * Valida la longitud de un apodo/nickname
 * @param nickname - Apodo a validar
 * @returns ValidationResult con isValid y error opcional
 */
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname || nickname.trim() === '') {
    return {
      isValid: false,
      error: 'El apodo es requerido'
    };
  }

  const trimmedNickname = nickname.trim();
  
  if (trimmedNickname.length < VALIDATION_RULES.NICKNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `El apodo debe tener al menos ${VALIDATION_RULES.NICKNAME_MIN_LENGTH} caracteres`
    };
  }

  if (trimmedNickname.length > VALIDATION_RULES.NICKNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `El apodo no puede tener más de ${VALIDATION_RULES.NICKNAME_MAX_LENGTH} caracteres`
    };
  }

  return { isValid: true };
}

/**
 * Valida que la edad esté en el rango permitido
 * @param age - Edad a validar
 * @returns ValidationResult con isValid y error opcional
 */
export function validateAge(age: number): ValidationResult {
  if (age === null || age === undefined || isNaN(age)) {
    return {
      isValid: false,
      error: 'La edad es requerida'
    };
  }

  if (age < VALIDATION_RULES.AGE_MIN) {
    return {
      isValid: false,
      error: `La edad debe ser al menos ${VALIDATION_RULES.AGE_MIN} años`
    };
  }

  if (age > VALIDATION_RULES.AGE_MAX) {
    return {
      isValid: false,
      error: `La edad no puede ser mayor a ${VALIDATION_RULES.AGE_MAX} años`
    };
  }

  return { isValid: true };
}

/**
 * Objeto ValidationService que agrupa todas las funciones de validación
 */
export const ValidationService = {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateNickname,
  validateAge
};
