/**
 * GroupStats - Estadísticas de grupo
 */

'use client';

import { useState } from 'react';

interface StudentGrade {
  id: string;
  name: string;
  grade: number;
}

export default function GroupStats() {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: StudentGrade = {
      id: Date.now().toString(),
      name,
      grade: parseFloat(grade),
    };
    setStudents([...students, newStudent]);
    setName('');
    setGrade('');
  };

  const average = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(2)
    : '0';

  const highest = students.length > 0 
    ? Math.max(...students.map(s => s.grade))
    : 0;

  const lowest = students.length > 0 
    ? Math.min(...students.map(s => s.grade))
    : 0;

  const passing = students.filter(s => s.grade >= 60).length;
  const failing = students.filter(s => s.grade < 60).length;

  return (
    <div className="space-y-6">
      <form onSubmit={addStudent} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del estudiante"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Calificación (0-100)"
            min="0"
            max="100"
            step="0.1"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Estudiante
        </button>
      </form>

      {students.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{average}</div>
              <div className="text-sm text-gray-600">Promedio</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 text-center">
              <div className="text-3xl font-bold text-green-600">{highest}</div>
              <div className="text-sm text-gray-600">Más Alta</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 text-center">
              <div className="text-3xl font-bold text-red-600">{lowest}</div>
              <div className="text-sm text-gray-600">Más Baja</div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{students.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Distribución</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600">{passing}</div>
                <div className="text-sm text-gray-600">Aprobados (≥60)</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-4xl font-bold text-red-600">{failing}</div>
                <div className="text-sm text-gray-600">Reprobados (&lt;60)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Lista de Estudiantes</h4>
            <div className="space-y-2">
              {students.sort((a, b) => b.grade - a.grade).map((student, index) => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">
                    {index + 1}. {student.name}
                  </span>
                  <span className={`font-bold ${student.grade >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {student.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {students.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Agrega estudiantes para ver estadísticas del grupo</p>
        </div>
      )}
    </div>
  );
}
