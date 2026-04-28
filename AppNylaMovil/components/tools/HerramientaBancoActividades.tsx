/**
 * ActivityBank - Banco de actividades reutilizables
 */

'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: string;
  materials: string;
}

export default function ActivityBank() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [materials, setMaterials] = useState('');

  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      id: Date.now().toString(),
      title,
      description,
      subject,
      duration,
      materials,
    };
    setActivities([...activities, newActivity]);
    setTitle('');
    setDescription('');
    setSubject('');
    setDuration('');
    setMaterials('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {showForm ? 'Cancelar' : '+ Nueva Actividad'}
      </button>

      {showForm && (
        <form onSubmit={addActivity} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la actividad"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción detallada"
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Materia"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duración (ej: 50 min)"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
          <textarea
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="Materiales necesarios"
            rows={2}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
          />
          <button
            type="submit"
            className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Guardar Actividad
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-900 mb-2">{activity.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">📚 Materia:</span> {activity.subject}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">⏱️ Duración:</span> {activity.duration}
              </div>
              {activity.materials && (
                <div className="flex items-start gap-2 text-gray-600">
                  <span className="font-semibold">🎒 Materiales:</span> {activity.materials}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <p>Crea tu banco de actividades reutilizables</p>
        </div>
      )}
    </div>
  );
}
