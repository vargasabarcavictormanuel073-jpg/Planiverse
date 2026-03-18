/**
 * Servicio de notificaciones push con Firebase Cloud Messaging
 * 
 * Este servicio maneja:
 * - Solicitud de permisos de notificación
 * - Registro de tokens FCM
 * - Recepción de notificaciones en primer plano
 * - Guardado de tokens en Firestore
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { FirestoreService } from './firestore.service';

export class NotificationService {
  private static messaging: Messaging | null = null;

  /**
   * Inicializar Firebase Messaging
   */
  private static initMessaging(): Messaging | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      if (!this.messaging) {
        this.messaging = getMessaging();
      }
      return this.messaging;
    } catch (error) {
      console.error('Error al inicializar Firebase Messaging:', error);
      return null;
    }
  }

  /**
   * Verificar si el navegador soporta notificaciones
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }

  /**
   * Obtener el estado actual de los permisos de notificación
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Solicitar permiso para enviar notificaciones
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso de notificaciones:', error);
      return false;
    }
  }

  /**
   * Obtener el token FCM del dispositivo
   */
  static async getDeviceToken(): Promise<string | null> {
    const messaging = this.initMessaging();
    if (!messaging) {
      return null;
    }

    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Obtener token
      const token = await getToken(messaging, {
        vapidKey: 'TU_VAPID_KEY', // Necesitas generar esto en Firebase Console
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log('Token FCM obtenido:', token);
        return token;
      } else {
        console.log('No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
      return null;
    }
  }

  /**
   * Guardar el token FCM en Firestore para el usuario
   */
  static async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      await FirestoreService.update('profile', 'data', {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
      }, userId);
      
      console.log('Token FCM guardado en Firestore');
    } catch (error) {
      console.error('Error al guardar token en Firestore:', error);
    }
  }

  /**
   * Inicializar notificaciones para un usuario
   * Solicita permiso, obtiene token y lo guarda
   */
  static async initializeNotifications(userId: string): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Solicitar permiso
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return false;
      }

      // Obtener token
      const token = await this.getDeviceToken();
      if (!token) {
        return false;
      }

      // Guardar token en Firestore
      await this.saveTokenToFirestore(userId, token);

      // Configurar listener para notificaciones en primer plano
      this.setupForegroundListener();

      return true;
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
    }
  }

  /**
   * Configurar listener para notificaciones en primer plano
   */
  static setupForegroundListener(): void {
    const messaging = this.initMessaging();
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Notificación recibida en primer plano:', payload);

      // Mostrar notificación personalizada
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        if (this.isSupported()) {
          new Notification(title || 'Planiverse', {
            body: body || '',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200],
          });
        }
      }
    });
  }

  /**
   * Verificar si el usuario ya dio permiso de notificaciones
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
}
