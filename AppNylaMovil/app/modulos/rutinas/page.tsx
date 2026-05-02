/**
 * RoutinesPage - Página de gestión de rutinas
 * 
 * Esta página permite a los usuarios crear y gestionar rutinas diarias o semanales.
 * Las rutinas se almacenan en Firestore y se sincronizan en tiempo real.
 * 
 * Funcionalidades:
 * - Crear nuevas rutinas con nombre y frecuencia (diaria o semanal)
 * - Activar/desactivar rutinas
 * - Eliminar rutinas
 * - Vista de lista con todas las rutinas del usuario
 * - Indicador visual del estado (activa/inactiva)
 * 
 * Las rutinas ayudan a los usuarios a mantener hábitos y organizar
 * actividades recurrentes de forma sistemática.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { useFirestore } from '@/firebase/hooks/useFirestore';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';

interface Routine {
  id?: string;
  name: string;
  frequency: 'daily' | 'weekly';
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function RoutinesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: routines, loading, error, addItem, updateItem, deleteItem } = useFirestore<Routine>('routines');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <AppLayout title="Rutinas">
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

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateItem(editingId, { name, frequency });
      setEditingId(null);
    } else {
      const newRoutine: Routine = { name, frequency, active: true };
      await addItem(newRoutine);
    }

    setName('');
    setFrequency('daily');
    setShowForm(false);
  };

  const handleEdit = (routine: Routine) => {
    if (!routine.id) return;
    setEditingId(routine.id);
    setName(routine.name);
    setFrequency(routine.frequency);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setFrequency('daily');
    setShowForm(false);
  };

  const toggleActive = async (routine: Routine) => {
    if (routine.id) {
      await updateItem(routine.id, { ...routine, active: !routine.active });
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    await deleteItem(id);
  };

  if (!user) {
    return (
      <AppLayout title="Rutinas">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Debes iniciar sesión para ver tus rutinas</p>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Rutinas">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando rutinas...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Rutinas">
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-800">Error al cargar rutinas: {String(error)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Rutinas">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
              🔄
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Rutinas</p>
              <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-green-100">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-500">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{routines.filter(r => r.active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gray-100">
              ⏸️
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">{routines.filter(r => !r.active).length}</p>
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
            placeholder="Buscar rutinas..."
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
              Nueva Rutina
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{editingId ? '✏️' : '✨'}</span>
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Rutina' : 'Nueva Rutina'}</h3>
          </div>
          <form onSubmit={handleAddRoutine} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📝 Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Ejercicio matutino, Lectura nocturna, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🔄 Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 font-medium"
              >
                <option value="daily">📅 Diaria</option>
                <option value="weekly">📆 Semanal</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                style={{ backgroundColor: 'var(--color-primary)' }}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                {editingId ? '💾 Guardar Cambios' : 'Guardar Rutina'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routines.filter(routine => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return routine.name.toLowerCase().includes(query);
        }).length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-gray-500 text-lg">No hay rutinas registradas</p>
            <p className="text-gray-400 text-sm mt-2">Crea una nueva para comenzar</p>
          </div>
        ) : (
          routines.filter(routine => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return routine.name.toLowerCase().includes(query);
          }).map((routine) => (
            <div
              key={routine.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                routine.active ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: routine.active ? 'var(--color-primary)' : '#E5E7EB', opacity: routine.active ? 0.2 : 1 }}>
                    {routine.frequency === 'daily' ? '📅' : '📆'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{routine.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {routine.frequency === 'daily' ? '🔄 Diaria' : '📆 Semanal'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => toggleActive(routine)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    routine.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {routine.active ? '✅ Activa' : '⏸️ Inactiva'}
                </button>
              </div>
              
              <button
                onClick={() => routine.id && handleDeleteRoutine(routine.id)}
                className="w-full px-4 py-2 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                🗑️ Eliminar
              </button>
              <button
                onClick={() => handleEdit(routine)}
                className="w-full mt-2 px-4 py-2 text-blue-600 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                ✏️ Editar
              </button>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
