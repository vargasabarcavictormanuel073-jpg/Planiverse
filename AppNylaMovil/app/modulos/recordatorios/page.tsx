/**
 * RemindersPage - Página de gestión de recordatorios
 * 
 * Esta página permite a los usuarios crear y gestionar recordatorios.
 * Los recordatorios se almacenan en Firestore y se sincronizan en tiempo real.
 * 
 * Funcionalidades:
 * - Crear nuevos recordatorios con título, fecha y hora
 * - Marcar recordatorios como completados
 * - Eliminar recordatorios
 * - Vista de lista ordenada por fecha y hora
 * - Indicador visual del estado (completado/pendiente)
 * 
 * Los recordatorios ayudan a los usuarios a no olvidar tareas importantes
 * o eventos que requieren atención en una fecha y hora específica.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { useFirestore } from '@/firebase/hooks/useFirestore';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';

interface Reminder {
  id?: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function RemindersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: reminders, loading, error, addItem, updateItem, deleteItem } = useFirestore<Reminder>('reminders');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <AppLayout title="Recordatorios">
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

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateItem(editingId, { title, date, time });
      setEditingId(null);
    } else {
      const newReminder: Reminder = { title, date, time, completed: false };
      await addItem(newReminder);
    }

    setTitle('');
    setDate('');
    setTime('');
    setShowForm(false);
  };

  const handleEdit = (reminder: Reminder) => {
    if (!reminder.id) return;
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setDate(reminder.date);
    setTime(reminder.time);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setTime('');
    setShowForm(false);
  };

  const toggleComplete = async (reminder: Reminder) => {
    if (reminder.id) {
      await updateItem(reminder.id, { ...reminder, completed: !reminder.completed });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    await deleteItem(id);
  };

  // Ordenar por fecha y hora y filtrar por búsqueda
  const sortedReminders = [...reminders]
    .filter(reminder => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return reminder.title.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeA - dateTimeB;
    });

  if (!user) {
    return (
      <AppLayout title="Recordatorios">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Debes iniciar sesión para ver tus recordatorios</p>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Recordatorios">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando recordatorios...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Recordatorios">
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-800">Error al cargar recordatorios: {String(error)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Recordatorios">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
              🔔
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-yellow-100">
              ⏰
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{reminders.filter(r => !r.completed).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-green-100">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-500">Completados</p>
              <p className="text-2xl font-bold text-gray-900">{reminders.filter(r => r.completed).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar recordatorios..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 bg-white placeholder-gray-400 font-medium"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { if (editingId) { handleCancelEdit(); } else { setShowForm(!showForm); } }}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
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
              Nuevo Recordatorio
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{editingId ? '✏️' : '✨'}</span>
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</h3>
          </div>
          <form onSubmit={handleAddReminder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📝 Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ej: Llamar al doctor, Comprar leche, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">⏰ Hora</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                {editingId ? '💾 Guardar Cambios' : 'Guardar Recordatorio'}
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

      <div className="space-y-3">
        {sortedReminders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500 text-lg">No hay recordatorios registrados</p>
            <p className="text-gray-400 text-sm mt-2">Crea uno nuevo para comenzar</p>
          </div>
        ) : (
          sortedReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 transition-all hover:shadow-md ${
                reminder.completed ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={reminder.completed}
                    onChange={() => toggleComplete(reminder)}
                    className="w-6 h-6 rounded-lg focus:ring-2 cursor-pointer"
                    style={{ 
                      accentColor: 'var(--color-primary)',
                      borderColor: 'var(--color-primary)'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-gray-900 text-lg mb-2 ${reminder.completed ? 'line-through' : ''}`}>
                    {reminder.title}
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(reminder.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {reminder.time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => reminder.id && handleDeleteReminder(reminder.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar recordatorio"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(reminder)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar recordatorio"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
