/**
 * AccessHistoryService - Servicio de historial de acceso
 *
 * Registra cada inicio de sesión con fecha, hora y dispositivo.
 * Los datos se guardan en localStorage y en Firestore.
 */

export interface AccessRecord {
  id: string;
  date: string;       // ISO string
  device: string;     // Descripción del dispositivo/navegador
  platform: string;   // Sistema operativo
  method: 'google' | 'email' | 'unknown';
}

const STORAGE_KEY = 'planiverse_access_history';
const MAX_RECORDS = 20; // Máximo de registros a guardar

export class AccessHistoryService {
  /**
   * Detecta el dispositivo/navegador del usuario
   */
  static getDeviceInfo(): { device: string; platform: string } {
    if (typeof window === 'undefined') {
      return { device: 'Desconocido', platform: 'Desconocido' };
    }

    const ua = navigator.userAgent;

    // Detectar navegador
    let device = 'Navegador desconocido';
    if (ua.includes('Chrome') && !ua.includes('Edg')) device = 'Chrome';
    else if (ua.includes('Firefox')) device = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) device = 'Safari';
    else if (ua.includes('Edg')) device = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) device = 'Opera';

    // Detectar plataforma
    let platform = 'Desconocido';
    if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
    else if (ua.includes('Windows')) platform = 'Windows';
    else if (ua.includes('Mac')) platform = 'Mac';
    else if (ua.includes('Linux')) platform = 'Linux';

    return { device, platform };
  }

  /**
   * Registra un nuevo acceso
   */
  static record(method: AccessRecord['method'] = 'unknown'): void {
    try {
      const { device, platform } = this.getDeviceInfo();
      const newRecord: AccessRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        device,
        platform,
        method,
      };

      const history = this.getAll();
      // Agregar al inicio y limitar a MAX_RECORDS
      const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silencioso — no interrumpir el login si falla
    }
  }

  /**
   * Obtiene todos los registros de acceso
   */
  static getAll(): AccessRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AccessRecord[];
    } catch {
      return [];
    }
  }

  /**
   * Limpia el historial
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silencioso
    }
  }
}
