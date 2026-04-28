/**
 * Dashboard - Página principal de la aplicación
 * Diseño mejorado con cards modernas, iconos y animaciones
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import NotificationPrompt from '@/components/modals/ModalSolicitarNotificaciones';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';
import { useFirestore } from '@/firebase/hooks/useFirestore';

interface Task {
  id?: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Event {
  id?: string;
  title: string;
  date: string;
}

interface Note {
  id?: string;
  title: string;
  content?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: tasks } = useFirestore<Task>('tasks');
  const { data: events } = useFirestore<Event>('calendar');
  const { data: notes } = useFirestore<Note>('notes');
  
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState<'tasks' | 'events' | 'notes' | null>(null);

  // Inicializar nickname y role desde localStorage
  const [nickname, setNickname] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Usuario';
    const profileData = localStorage.getItem('planiverse_profile');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.nickname || 'Usuario';
      } catch {
        return 'Usuario';
      }
    }
    return 'Usuario';
  });

  const [role, setRole] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('planiverse_role') || '';
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/');
      return;
    }
    
    try {
      const session = LocalStorageManager.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const profile = LocalStorageManager.getProfile(session.userId);
      const roleData = localStorage.getItem('planiverse_role');
      
      if (profile) {
        // Solo actualizar si los valores son diferentes
        const newNickname = profile.nickname || 'Usuario';
        const newRole = profile.role || roleData || '';
        
        if (newNickname !== nickname) {
          // Usar setTimeout para evitar setState durante render
          setTimeout(() => setNickname(newNickname), 0);
        }
        if (newRole !== role) {
          setTimeout(() => setRole(newRole), 0);
        }
      } else {
        const profileData = localStorage.getItem('planiverse_profile');
        if (profileData) {
          try {
            const parsed = JSON.parse(profileData);
            const newNickname = parsed.nickname || 'Usuario';
            if (newNickname !== nickname) {
              setTimeout(() => setNickname(newNickname), 0);
            }
          } catch {
            // Mantener valor por defecto
          }
        }
        if (roleData && roleData !== role) {
          setTimeout(() => setRole(roleData), 0);
        }
      }
      
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => setIsLoading(false), 0);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      router.push('/');
    }
  }, [router, user, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }
  
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const todayEvents = events.filter(e => e.date === new Date().toISOString().split('T')[0]).length;
  const totalNotes = notes.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <AppLayout title="Inicio">
      <NotificationPrompt />
      
      {/* Header con saludo personalizado */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {nickname}! 👋
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {role === 'student' && 'Organiza tus estudios y alcanza tus metas académicas.'}
          {role === 'teacher' && 'Gestiona tus clases y planeaciones de forma eficiente.'}
          {role === 'other' && 'Tu espacio personal para organizarte mejor.'}
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {role === 'student' && (
          <>
            <StatCard 
              title="Tareas pendientes" 
              value={pendingTasks} 
              subtitle={pendingTasks === 1 ? 'tarea por completar' : 'tareas por completar'}
              icon={<TaskIcon />}
              onClick={() => setShowModal('tasks')}
              delay="0ms"
            />
            <StatCard 
              title="Eventos de hoy" 
              value={todayEvents} 
              subtitle={todayEvents === 1 ? 'evento programado' : 'eventos programados'}
              icon={<CalendarIcon />}
              onClick={() => setShowModal('events')}
              delay="100ms"
            />
            <StatCard 
              title="Notas guardadas" 
              value={totalNotes} 
              subtitle={totalNotes === 1 ? 'nota disponible' : 'notas disponibles'}
              icon={<NoteIcon />}
              onClick={() => setShowModal('notes')}
              delay="200ms"
            />
          </>
        )}

        {role === 'teacher' && (
          <>
            <StatCard 
              title="Eventos de hoy" 
              value={todayEvents} 
              subtitle={todayEvents === 1 ? 'evento programado' : 'eventos programados'}
              icon={<CalendarIcon />}
              onClick={() => setShowModal('events')}
              delay="0ms"
            />
            <StatCard 
              title="Planeaciones pendientes" 
              value={pendingTasks} 
              subtitle={pendingTasks === 1 ? 'planeación por completar' : 'planeaciones por completar'}
              icon={<TaskIcon />}
              onClick={() => setShowModal('tasks')}
              delay="100ms"
            />
            <StatCard 
              title="Notas guardadas" 
              value={totalNotes} 
              subtitle={totalNotes === 1 ? 'nota disponible' : 'notas disponibles'}
              icon={<NoteIcon />}
              onClick={() => setShowModal('notes')}
              delay="200ms"
            />
          </>
        )}

        {role === 'other' && (
          <>
            <StatCard 
              title="Tareas pendientes" 
              value={pendingTasks} 
              subtitle={pendingTasks === 1 ? 'tarea por completar' : 'tareas por completar'}
              icon={<TaskIcon />}
              onClick={() => setShowModal('tasks')}
              delay="0ms"
            />
            <StatCard 
              title="Eventos de hoy" 
              value={todayEvents} 
              subtitle={todayEvents === 1 ? 'evento programado' : 'eventos programados'}
              icon={<CalendarIcon />}
              onClick={() => setShowModal('events')}
              delay="100ms"
            />
            <StatCard 
              title="Notas guardadas" 
              value={totalNotes} 
              subtitle={totalNotes === 1 ? 'nota disponible' : 'notas disponibles'}
              icon={<NoteIcon />}
              onClick={() => setShowModal('notes')}
              delay="200ms"
            />
          </>
        )}
      </div>

      {/* Modales */}
      {showModal === 'tasks' && (
        <Modal title={role === 'teacher' ? 'Planeaciones Pendientes' : 'Tareas Pendientes'} onClose={() => setShowModal(null)}>
          <div className="space-y-3">
            {tasks.filter(t => !t.completed).length === 0 ? (
              <EmptyState message={role === 'teacher' ? 'No hay planeaciones pendientes' : 'No hay tareas pendientes'} />
            ) : (
              tasks.filter(t => !t.completed).map((task) => (
                <ItemCard key={task.id}>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vence: {new Date(task.dueDate).toLocaleDateString('es-ES')}</p>
                </ItemCard>
              ))
            )}
          </div>
        </Modal>
      )}

      {showModal === 'events' && (
        <Modal title="Eventos de Hoy" onClose={() => setShowModal(null)}>
          <div className="space-y-3">
            {events.filter(e => e.date === new Date().toISOString().split('T')[0]).length === 0 ? (
              <EmptyState message="No hay eventos para hoy" />
            ) : (
              events.filter(e => e.date === new Date().toISOString().split('T')[0]).map((event) => (
                <ItemCard key={event.id}>
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                </ItemCard>
              ))
            )}
          </div>
        </Modal>
      )}

      {showModal === 'notes' && (
        <Modal title="Notas Guardadas" onClose={() => setShowModal(null)}>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <EmptyState message="No hay notas guardadas" />
            ) : (
              notes.map((note) => (
                <ItemCard key={note.id}>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{note.title}</h4>
                  {note.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                  )}
                </ItemCard>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Accesos rápidos mejorados */}
      <div className="quick-access-card rounded-2xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h3 className="text-xl font-bold stat-card-title mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink href="/task" label={role === 'teacher' ? 'Planeaciones' : 'Tareas'} icon={<TaskIcon />} />
          <QuickLink href="/calendar" label="Calendario" icon={<CalendarIcon />} />
          <QuickLink href="/notes" label="Notas" icon={<NoteIcon />} />
          <QuickLink href="/reminders" label="Recordatorios" icon={<BellIcon />} />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, subtitle, icon, onClick, delay }: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: React.ReactNode;
  onClick: () => void;
  delay: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group stat-card rounded-2xl shadow-sm p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer text-left w-full animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="icon-background p-3 rounded-xl transition-colors duration-300">
          <div style={{ color: 'var(--color-primary)' }}>
            {icon}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="text-4xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
        {value}
      </div>
      <h4 className="text-lg font-semibold stat-card-title mb-1">{title}</h4>
      <p className="text-sm stat-card-subtitle">{subtitle}</p>
    </button>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-current hover:shadow-md transition-all duration-300"
      style={{ color: 'var(--color-primary)' }}
    >
      <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="font-semibold text-gray-900 text-center">{label}</span>
    </a>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--color-background)' }}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-current hover:shadow-md transition-all duration-300" style={{ borderColor: 'var(--color-primary)' }}>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

// Iconos SVG
function TaskIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
