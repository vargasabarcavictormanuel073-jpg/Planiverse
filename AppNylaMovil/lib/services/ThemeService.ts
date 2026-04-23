/**
 * ThemeService - Servicio para gestión de modo oscuro/claro
 * Módulo: Servicios / Tema Visual
 *
 * Maneja el estado del modo oscuro/claro de la aplicación.
 * Lee y guarda la preferencia en localStorage bajo la clave "planiverse_dark_mode".
 * Aplica o remueve la clase "dark" en el elemento raíz del documento.
 */

export class ThemeService {
  private static readonly THEME_KEY = 'planiverse_dark_mode';

  /**
   * Verifica si el modo oscuro está activado
   */
  static isDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(this.THEME_KEY);
    return saved === 'true';
  }

  /**
   * Activa o desactiva el modo oscuro
   */
  static setDarkMode(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.THEME_KEY, enabled.toString());
    
    // Siempre remover primero, luego agregar si es necesario
    document.documentElement.classList.remove('dark');
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    }
  }

  /**
   * Alterna entre modo oscuro y claro
   */
  static toggleDarkMode(): boolean {
    const newValue = !this.isDarkMode();
    this.setDarkMode(newValue);
    return newValue;
  }

  /**
   * Inicializa el tema al cargar la página
   */
  static initialize(): void {
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    }
  }
}
