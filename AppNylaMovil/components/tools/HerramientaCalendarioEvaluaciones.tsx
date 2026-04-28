/**
 * EvaluationCalendar - Calendario de evaluaciones
 */

'use client';

import { useState } from 'react';

interface Evaluation {
  id: string;
  title: string;
  date: string;
  group: string;
  type: string;
}

export default function EvaluationCalendar() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [group, setGroup] = useState('');
  const [type, setType] = useState('Examen');

  const addEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const newEval: Evaluation = {
      id: Date.now().toString(),
      title,
      date,
      group,
      type,
    };
    setEvaluations([...evaluations, newEval].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setTitle('');
    setDate('');
    setGroup('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addEvaluation} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la evaluación"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Grupo"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
          >
            <option>Examen</option>
            <option>Proyecto</option>
            <option>Tarea</option>
            <option>Presentación</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Evaluación
        </button>
      </form>

      <div className="space-y-3">
        {evaluations.map(evaluation => (
          <div key={evaluation.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{evaluation.title}</h4>
                <p className="text-sm text-gray-600">Grupo: {evaluation.group}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {evaluation.type}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {new Date(evaluation.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {evaluations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Programa tus evaluaciones</p>
        </div>
      )}
    </div>
  );
}
