/**
 * CalendarPage - Página de gestión de eventos del calendario
 * 
 * Esta página permite a los usuarios crear y gestionar eventos en un calendario.
 * Los eventos se almacenan en Firestore y se sincronizan en tiempo real.
 * 
 * Funcionalidades:
 * - Seleccionar fecha en un input de tipo date
 * - Crear eventos con título, hora y tipo (para estudiantes)
 * - Ver eventos del día seleccionado
 * - Eliminar eventos
 * - Los eventos se organizan por fecha
 * 
 * La interfaz se adapta según el rol del usuario:
 * - Estudiantes: Pueden especificar el tipo de evento (clase, examen, tarea, etc.)
 * - Maestros y otros: Eventos genéricos sin tipo específico
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { useFirestore } from '@/firebase/hooks/useFirestore';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';

interface Event {
  id?: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: events, loading, error, addItem, updateItem, deleteItem } = useFirestore<Event>('calendar');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inicializar role desde localStorage
  const [role, setRole] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('planiverse_role') || '';
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Solo actualizar si el valor cambió y no estamos en el primer render
    if (typeof window !== 'undefined') {
      const roleData = localStorage.getItem('planiverse_role');
      if (roleData && roleData !== role) {
        // Usar setTimeout para evitar setState durante render
        setTimeout(() => setRole(roleData), 0);
      }
    }
  }, []); // Solo ejecutar una vez al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  
  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <AppLayout title="Calendario">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Redirigir si no hay usuario
  if (!user) {
    return null;
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const updates: Partial<Event> = { title };
      if (time) updates.time = time;
      if (eventType) updates.type = eventType;
      await updateItem(editingId, updates);
      setEditingId(null);
    } else {
      const newEvent: Event = { title, date: selectedDate };
      if (time) newEvent.time = time;
      if (eventType) newEvent.type = eventType;
      await addItem(newEvent);
    }

    setTitle('');
    setTime('');
    setEventType('');
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    if (!event.id) return;
    setEditingId(event.id);
    setTitle(event.title);
    setTime(event.time || '');
    setEventType(event.type || '');
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setTime('');
    setEventType('');
    setShowForm(false);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteItem(id);
  };

  const eventsForSelectedDate = events
    .filter(event => event.date === selectedDate)
    .filter(event => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return event.title.toLowerCase().includes(query) || 
             (event.type && event.type.toLowerCase().includes(query));
    })
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const getEventTypes = () => {
    if (role === 'student') return ['Clase', 'Examen', 'Tarea', 'Otro'];
    if (role === 'teacher') return ['Clase', 'Reunión', 'Entrega', 'Otro'];
    return ['Evento', 'Reunión', 'Recordatorio', 'Otro'];
  };

  if (!user) {
    return (
      <AppLayout title="Calendario">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Debes iniciar sesión para ver tu calendario</p>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Calendario">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando eventos...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Calendario">
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-800">Error al cargar eventos: {String(error)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Calendario">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)20' }}>
              📅
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)20' }}>
              📍
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{eventsForSelectedDate.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)20' }}>
              🗓️
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Seleccionada</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 bg-white placeholder-gray-400 font-medium"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de fecha */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📆</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seleccionar Fecha</h3>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 font-bold"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="w-full mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Evento
                </>
              )}
            </button>
            
            {events.length > 0 && (
              <button
                onClick={async () => {
                  if (confirm('¿Estás seguro de que quieres eliminar TODOS los eventos? Esta acción no se puede deshacer.')) {
                    for (const event of events) {
                      if (event.id) {
                        await deleteItem(event.id);
                      }
                    }
                  }
                }}
                className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar Todos
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-4 animate-scale-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{editingId ? '✏️' : '✨'}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ej: Reunión, Clase, Examen, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">⏰ Hora (opcional)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🏷️ Tipo (opcional)</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium"
                  >
                    <option value="">Seleccionar...</option>
                    {getEventTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    {editingId ? '💾 Guardar Cambios' : 'Guardar Evento'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Lista de eventos */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>

            <div className="space-y-3">
              {eventsForSelectedDate.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-500 text-lg">No hay eventos para esta fecha</p>
                  <p className="text-gray-400 text-sm mt-2">Crea uno nuevo para comenzar</p>
                </div>
              ) : (
                eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--color-primary)20' }}>
                        {event.type === 'Clase' ? '📚' : event.type === 'Examen' ? '📝' : event.type === 'Tarea' ? '✏️' : event.type === 'Reunión' ? '👥' : '📌'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{event.title}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          {event.time && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.time}
                            </span>
                          )}
                          {event.type && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                              {event.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => event.id && handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar evento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar evento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
