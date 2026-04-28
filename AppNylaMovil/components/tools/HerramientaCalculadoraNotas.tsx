/**
 * GradeCalculator - Calculadora de promedio académico
 */

'use client';

import { useState } from 'react';

interface Grade {
  id: string;
  subject: string;
  grade: number;
  weight: number;
}

export default function GradeCalculator() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [weight, setWeight] = useState('1');

  const addGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade) return;

    const newGrade: Grade = {
      id: Date.now().toString(),
      subject,
      grade: parseFloat(grade),
      weight: parseFloat(weight),
    };

    setGrades([...grades, newGrade]);
    setSubject('');
    setGrade('');
    setWeight('1');
  };

  const removeGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    
    const totalWeightedGrade = grades.reduce((sum, g) => sum + (g.grade * g.weight), 0);
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    
    return (totalWeightedGrade / totalWeight).toFixed(2);
  };

  const average = calculateAverage();

  return (
    <div className="space-y-6">
      <form onSubmit={addGrade} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Materia</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Matemáticas"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Calificación</label>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="0-100"
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (%)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="1"
              min="0.1"
              step="0.1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Calificación
        </button>
      </form>

      {grades.length > 0 && (
        <>
          <div className="space-y-3">
            {grades.map((g) => (
              <div key={g.id} className="flex items-center justify-between bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{g.subject}</h4>
                  <p className="text-sm text-gray-600">Calificación: {g.grade} | Peso: {g.weight}%</p>
                </div>
                <button
                  onClick={() => removeGrade(g.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center">
            <p className="text-lg mb-2">Tu Promedio</p>
            <p className="text-6xl font-bold">{average}</p>
            <p className="text-sm mt-2 opacity-90">Basado en {grades.length} calificación{grades.length !== 1 ? 'es' : ''}</p>
          </div>
        </>
      )}

      {grades.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Agrega tus calificaciones para calcular tu promedio</p>
        </div>
      )}
    </div>
  );
}
