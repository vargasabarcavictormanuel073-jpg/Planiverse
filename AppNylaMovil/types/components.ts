/**
 * Tipos y constantes para los módulos de la aplicación
 * 
 * Define los tipos de módulos disponibles en Planiverse y sus metadatos:
 * - Tareas: Gestión de tareas pendientes
 * - Calendario: Organización de eventos
 * - Rutinas: Creación de hábitos diarios
 * - Notas: Captura de ideas
 * - Recordatorios: Alertas importantes
 */

// Tipos de datos para el wizard de configuración de Planiverse

export type ModuleType = 'tasks' | 'calendar' | 'routines' | 'notes' | 'reminders';

export interface Module {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
}

export const AVAILABLE_MODULES: Module[] = [
  {
    id: 'tasks',
    name: 'Tareas',
    description: 'Gestiona tus tareas pendientes',
    icon: '✓'
  },
  {
    id: 'calendar',
    name: 'Calendario',
    description: 'Organiza tus eventos',
    icon: '📅'
  },
  {
    id: 'routines',
    name: 'Rutinas',
    description: 'Crea hábitos diarios',
    icon: '🔄'
  },
  {
    id: 'notes',
    name: 'Notas',
    description: 'Captura tus ideas',
    icon: '📝'
  },
  {
    id: 'reminders',
    name: 'Recordatorios',
    description: 'No olvides nada importante',
    icon: '🔔'
  }
];
