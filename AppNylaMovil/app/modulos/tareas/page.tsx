'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { useFirestore } from '@/firebase/hooks/useFirestore';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';

interface Task {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
}

export default function TaskPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: tasks, loading, addItem, updateItem, deleteItem } = useFirestore<Task>('tasks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <AppLayout title="Tareas">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: Task = { title, description, completed: false, priority };
    if (dueDate) newTask.dueDate = dueDate;
    await addItem(newTask);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!id) return;
    await updateItem(id, { completed: !completed });
  };

  const handleDeleteTask = async (id: string) => {
    if (!id) return;
    await deleteItem(id);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return task.title.toLowerCase().includes(query) || 
           task.description.toLowerCase().includes(query);
  });

  const stats = { total: tasks.length, active: tasks.filter(t => !t.completed).length, completed: tasks.filter(t => t.completed).length };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <AppLayout title="Tareas">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando tareas...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Tareas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>📋</div>
            <div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">⏳</div>
            <div><p className="text-sm text-gray-500">Activas</p><p className="text-2xl font-bold text-gray-900">{stats.active}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✅</div>
            <div><p className="text-sm text-gray-500">Completadas</p><p className="text-2xl font-bold text-gray-900">{stats.completed}</p></div>
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
            placeholder="Buscar tareas..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 bg-white placeholder-gray-400 font-medium"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-semibold text-gray-900">Nueva Tarea</h3>
        </div>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Que necesitas hacer?" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white font-medium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Agrega mas detalles..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha limite</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white font-medium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white font-medium">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--color-primary)' }} className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">Agregar Tarea</button>
        </form>
      </div>

      <div className="flex gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
        <button onClick={() => setFilter('all')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${filter === 'all' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`} style={filter === 'all' ? { backgroundColor: 'var(--color-primary)' } : {}}>Todas ({stats.total})</button>
        <button onClick={() => setFilter('active')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${filter === 'active' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Activas ({stats.active})</button>
        <button onClick={() => setFilter('completed')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${filter === 'completed' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Completadas ({stats.completed})</button>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No hay tareas {filter === 'active' ? 'activas' : filter === 'completed' ? 'completadas' : ''}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 hover:shadow-md transition-all ${task.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => task.id && handleToggleComplete(task.id, task.completed)} className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'}`}>
                  {task.completed && (<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                </button>
                <div className="flex-1">
                  <h4 className={`font-semibold text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                  {task.description && (<p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>)}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${getPriorityColor(task.priority)}`}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</span>
                    {task.dueDate && (<span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">📅 {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>)}
                  </div>
                </div>
                <button onClick={() => task.id && handleDeleteTask(task.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
