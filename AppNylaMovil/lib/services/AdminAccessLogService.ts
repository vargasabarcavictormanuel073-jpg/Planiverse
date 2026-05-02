/**
 * AdminAccessLogService - Registra accesos en Firestore para el panel de admin
 *
 * Cada login exitoso guarda un documento en la colección global `access_logs`.
 * Solo el correo administrador puede leer esa colección.
 */

import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const ADMIN_EMAIL = 'sistemsvlu@gmail.com';

export interface AccessLog {
  id?: string;
  userId: string;
  email: string;
  date: string;         // ISO string
  device: string;
  platform: string;
  method: 'google' | 'email' | 'unknown';
  createdAt?: unknown;
}

export class AdminAccessLogService {
  /**
   * Detecta navegador y plataforma
   */
  static getDeviceInfo(): { device: string; platform: string } {
    if (typeof window === 'undefined') return { device: 'Desconocido', platform: 'Desconocido' };
    const ua = navigator.userAgent;
    let device = 'Navegador';
    if (ua.includes('Chrome') && !ua.includes('Edg')) device = 'Chrome';
    else if (ua.includes('Firefox')) device = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) device = 'Safari';
    else if (ua.includes('Edg')) device = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) device = 'Opera';

    let platform = 'Desconocido';
    if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
    else if (ua.includes('Windows')) platform = 'Windows';
    else if (ua.includes('Mac')) platform = 'Mac';
    else if (ua.includes('Linux')) platform = 'Linux';

    return { device, platform };
  }

  /**
   * Registra un acceso en Firestore
   */
  static async record(
    userId: string,
    email: string,
    method: AccessLog['method'] = 'unknown'
  ): Promise<void> {
    try {
      const { device, platform } = this.getDeviceInfo();
      await addDoc(collection(db, 'access_logs'), {
        userId,
        email,
        date: new Date().toISOString(),
        device,
        platform,
        method,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // Silencioso — no interrumpir el login
      console.warn('No se pudo registrar el acceso:', err);
    }
  }

  /**
   * Obtiene todos los logs (solo para admin)
   */
  static async getAll(maxRecords = 100): Promise<AccessLog[]> {
    try {
      const q = query(
        collection(db, 'access_logs'),
        orderBy('createdAt', 'desc'),
        limit(maxRecords)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));
    } catch (err) {
      console.error('Error obteniendo logs:', err);
      return [];
    }
  }
}
