/**
 * ShareService - Servicio para compartir contenido
 */

interface ShareableTask {
  title: string;
  group?: string;
  learningObjective?: string;
  resources?: string;
  estimatedDuration?: string;
  subject?: string;
  dueDate?: string;
  priority?: string;
  tags?: string[];
}

interface ShareableNote {
  title: string;
  content: string;
  tags?: string[];
}

export class ShareService {
  /**
   * Copia texto al portapapeles
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error al copiar:', error);
      return false;
    }
  }

  /**
   * Genera un texto compartible para una tarea
   */
  static generateTaskShareText(task: ShareableTask, role: string = 'student'): string {
    const label = role === 'teacher' ? 'Planeación' : 'Tarea';
    let text = `📋 ${label}: ${task.title}\n\n`;
    
    if (role === 'teacher') {
      if (task.group) text += `👥 Grupo: ${task.group}\n`;
      if (task.learningObjective) text += `🎯 Objetivo: ${task.learningObjective}\n`;
      if (task.resources) text += `📚 Recursos: ${task.resources}\n`;
      if (task.estimatedDuration) text += `⏱️ Duración: ${task.estimatedDuration}\n`;
    } else {
      if (task.subject) text += `📚 Materia: ${task.subject}\n`;
    }
    
    text += `⚡ Prioridad: ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}\n`;
    text += `📅 Fecha: ${task.dueDate}\n`;
    text += `✅ Estado: ${task.completed ? 'Completada' : 'Pendiente'}\n`;
    
    if (task.tags && task.tags.length > 0) {
      text += `🏷️ Etiquetas: ${task.tags.join(', ')}\n`;
    }
    
    text += `\n📱 Compartido desde Planiverse`;
    
    return text;
  }

  /**
   * Genera un texto compartible para una nota
   */
  static generateNoteShareText(note: ShareableNote): string {
    let text = `📝 Nota: ${note.title}\n\n`;
    text += `${note.content}\n\n`;
    
    if (note.tags && note.tags.length > 0) {
      text += `🏷️ Etiquetas: ${note.tags.join(', ')}\n\n`;
    }
    
    text += `📱 Compartido desde Planiverse`;
    
    return text;
  }

  /**
   * Comparte usando la API nativa de compartir (si está disponible)
   */
  static async shareNative(title: string, text: string): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return true;
      } catch (error) {
        console.error('Error al compartir:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Genera URL de WhatsApp para compartir
   */
  static getWhatsAppUrl(text: string): string {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  /**
   * Genera URL de email para compartir
   */
  static getEmailUrl(subject: string, body: string): string {
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}
