/**
 * ThemeManager - Servicio para gestión de temas visuales
 * Feature: user-authentication-profiles
 * 
 * Este servicio gestiona la aplicación de temas dinámicos basados en roles de usuario.
 * Los temas se aplican mediante CSS custom properties (variables CSS) que se actualizan
 * en el elemento raíz del documento.
 * 
 * Requisitos: 5.5, 6.1-6.6
 */

import { Theme, UserRole } from '../types';
import { THEMES } from '../constants';

/**
 * Servicio para gestión de temas visuales
 */
export class ThemeManager {
  /**
   * Obtiene el tema correspondiente a un rol de usuario
   * 
   * @param role - Rol del usuario (student, teacher, other)
   * @returns Tema asociado al rol
   * 
   * @example
   * const theme = ThemeManager.getThemeForRole('student');
   * // Returns: { role: 'student', colors: { primary: '#3B82F6', ... } }
   */
  static getThemeForRole(role: UserRole): Theme {
    return THEMES[role];
  }

  /**
   * Aplica un tema actualizando las CSS custom properties en el documento
   * 
   * Este método actualiza las variables CSS en el elemento :root del documento,
   * permitiendo que todos los componentes que usen estas variables reflejen
   * el nuevo tema inmediatamente.
   * 
   * @param theme - Tema a aplicar (puede ser un objeto Theme o un UserRole string)
   * 
   * @example
   * const theme = ThemeManager.getThemeForRole('teacher');
   * ThemeManager.applyTheme(theme);
   * // Las variables CSS se actualizan en :root
   */
  static applyTheme(theme: Theme | UserRole): void {
    if (typeof document === 'undefined') {
      // No hacer nada en entorno servidor (SSR)
      return;
    }

    // Si theme es un string (UserRole), obtener el tema completo
    const fullTheme = typeof theme === 'string' ? this.getThemeForRole(theme) : theme;
    
    // Validar que el tema tenga la estructura correcta
    if (!fullTheme || !fullTheme.colors) {
      console.warn('Invalid theme provided to applyTheme:', theme);
      return;
    }

    const root = document.documentElement;

    // Actualizar CSS custom properties
    root.style.setProperty('--color-primary', fullTheme.colors.primary);
    root.style.setProperty('--color-primary-hover', fullTheme.colors.primaryHover);
    root.style.setProperty('--color-primary-active', fullTheme.colors.primaryActive);
    root.style.setProperty('--color-secondary', fullTheme.colors.secondary);
    root.style.setProperty('--color-accent', fullTheme.colors.accent);
    root.style.setProperty('--color-background', fullTheme.colors.background);
    root.style.setProperty('--color-text', fullTheme.colors.text);
    root.style.setProperty('--color-text-secondary', fullTheme.colors.textSecondary);

    // Guardar el rol del tema actual como atributo data para debugging
    root.setAttribute('data-theme', fullTheme.role);
  }

  /**
   * Obtiene el tema actualmente aplicado leyendo las CSS custom properties
   * 
   * @returns Tema actual o null si no hay tema aplicado
   * 
   * @example
   * const currentTheme = ThemeManager.getCurrentTheme();
   * if (currentTheme) {
   *   console.log('Current theme role:', currentTheme.role);
   * }
   */
  static getCurrentTheme(): Theme | null {
    if (typeof document === 'undefined') {
      // Retornar null en entorno servidor (SSR)
      return null;
    }

    const root = document.documentElement;
    const themeRole = root.getAttribute('data-theme') as UserRole | null;

    if (!themeRole) {
      return null;
    }

    // Leer las CSS custom properties actuales
    const computedStyle = getComputedStyle(root);

    return {
      role: themeRole,
      colors: {
        primary: computedStyle.getPropertyValue('--color-primary').trim(),
        primaryHover: computedStyle.getPropertyValue('--color-primary-hover').trim(),
        primaryActive: computedStyle.getPropertyValue('--color-primary-active').trim(),
        secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
        accent: computedStyle.getPropertyValue('--color-accent').trim(),
        background: computedStyle.getPropertyValue('--color-background').trim(),
        text: computedStyle.getPropertyValue('--color-text').trim(),
        textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
      }
    };
  }
}
