/**
 * NotificationsService - Servicio de notificaciones del navegador
 * Módulo: Servicios / Notificaciones
 *
 * Usa la Web Notifications API para enviar notificaciones push.
 * Funciona en web y Android (PWA) sin necesidad de Firebase Cloud Messaging.
 * Solicita permiso al usuario antes de enviar notificaciones.
 */

export class NotificationService {

  /**
   * Verificar si el navegador soporta notificaciones
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window;
  }

  /**
   * Obtener el estado actual de los permisos de notificación
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicitar permiso para enviar notificaciones
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Verificar si el usuario ya dio permiso
   */
  static hasPermission(): boolean {
    return this.getPermissionStatus() === 'granted';
  }

  /**
   * Verificar si el usuario rechazó las notificaciones
   */
  static isDenied(): boolean {
    return this.getPermissionStatus() === 'denied';
  }

  /**
   * Inicializar notificaciones — solicita permiso y envía una notificación de bienvenida
   */
  static async initializeNotifications(userId: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    const granted = await this.requestPermission();
    if (!granted) return false;

    // Guardar en localStorage que el usuario activó notificaciones
    try {
      localStorage.setItem('planiverse_notifications_enabled', 'true');
      localStorage.setItem('planiverse_notifications_userId', userId);
    } catch { /* ignore */ }

    // Enviar notificación de bienvenida
    this.sendLocalNotification(
      '🔔 Notificaciones activadas',
      'Recibirás recordatorios de tareas, eventos y más.'
    );

    return true;
  }

  /**
   * Enviar una notificación local inmediata
   */
  static sendLocalNotification(title: string, body: string, icon = '/icon-192x192.png'): void {
    if (!this.hasPermission()) return;
    try {
      new Notification(title, { body, icon });
    } catch { /* ignore */ }
  }

  /**
   * Programar una notificación con retraso (en milisegundos)
   * Útil para recordatorios de tareas o eventos
   */
  static scheduleNotification(title: string, body: string, delayMs: number): void {
    if (!this.hasPermission()) return;
    setTimeout(() => {
      this.sendLocalNotification(title, body);
    }, delayMs);
  }
}
