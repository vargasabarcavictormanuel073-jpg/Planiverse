/**
 * RubricGenerator - Generador de rúbricas de evaluación
 */

'use client';

import { useState } from 'react';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  levels: { level: string; description: string; points: number }[];
}

export default function RubricGenerator() {
  const [rubricName, setRubricName] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [criterionName, setCriterionName] = useState('');
  const [weight, setWeight] = useState('25');

  const addCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      name: criterionName,
      weight: parseInt(weight),
      levels: [
        { level: 'Excelente', description: '', points: 100 },
        { level: 'Bueno', description: '', points: 75 },
        { level: 'Regular', description: '', points: 50 },
        { level: 'Insuficiente', description: '', points: 25 },
      ],
    };
    setCriteria([...criteria, newCriterion]);
    setCriterionName('');
    setWeight('25');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Rúbrica</label>
        <input
          type="text"
          value={rubricName}
          onChange={(e) => setRubricName(e.target.value)}
          placeholder="Ej: Rúbrica de Presentación Oral"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
        />
      </div>

      <form onSubmit={addCriterion} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-gray-900">Agregar Criterio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del criterio</label>
            <input
              type="text"
              value={criterionName}
              onChange={(e) => setCriterionName(e.target.value)}
              placeholder="Ej: Contenido, Presentación"
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
              min="1"
              max="100"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Criterio
        </button>
      </form>

      {criteria.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 overflow-x-auto">
          <h4 className="font-bold text-gray-900 mb-4">{rubricName || 'Mi Rúbrica'}</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left">Criterio (Peso)</th>
                <th className="border-2 border-gray-300 bg-green-100 p-3">Excelente (100%)</th>
                <th className="border-2 border-gray-300 bg-blue-100 p-3">Bueno (75%)</th>
                <th className="border-2 border-gray-300 bg-yellow-100 p-3">Regular (50%)</th>
                <th className="border-2 border-gray-300 bg-red-100 p-3">Insuficiente (25%)</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map(criterion => (
                <tr key={criterion.id}>
                  <td className="border-2 border-gray-300 p-3 font-semibold">
                    {criterion.name} ({criterion.weight}%)
                  </td>
                  {criterion.levels.map((level, idx) => (
                    <td key={idx} className="border-2 border-gray-300 p-3 text-sm">
                      {level.description || 'Descripción del nivel'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
