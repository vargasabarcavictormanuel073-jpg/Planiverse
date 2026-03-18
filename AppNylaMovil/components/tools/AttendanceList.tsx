/**
 * AttendanceList - Lista de asistencia para maestros
 */

'use client';

import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface AttendanceSession {
  id: string;
  date: string;
  group: string;
  students: Student[];
}

export default function AttendanceList() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [group, setGroup] = useState('');
  const [studentName, setStudentName] = useState('');

  const startNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: AttendanceSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      group,
      students: [],
    };
    setCurrentSession(newSession);
    setGroup('');
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: studentName,
      status: 'present',
    };

    setCurrentSession({
      ...currentSession,
      students: [...currentSession.students, newStudent],
    });
    setStudentName('');
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    if (!currentSession) return;

    setCurrentSession({
      ...currentSession,
      students: currentSession.students.map(s => 
        s.id === studentId ? { ...s, status } : s
      ),
    });
  };

  const saveSession = () => {
    if (!currentSession) return;
    setSessions([currentSession, ...sessions]);
    setCurrentSession(null);
  };

  const getStatusConfig = (status: Student['status']) => {
    switch (status) {
      case 'present':
        return { label: 'Presente', bg: 'bg-green-100', text: 'text-green-800', icon: '✓' };
      case 'absent':
        return { label: 'Ausente', bg: 'bg-red-100', text: 'text-red-800', icon: '✗' };
      case 'late':
        return { label: 'Retardo', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏰' };
      case 'excused':
        return { label: 'Justificado', bg: 'bg-blue-100', text: 'text-blue-800', icon: '📝' };
    }
  };

  const getSessionStats = (session: AttendanceSession) => {
    const total = session.students.length;
    const present = session.students.filter(s => s.status === 'present').length;
    const absent = session.students.filter(s => s.status === 'absent').length;
    const late = session.students.filter(s => s.status === 'late').length;
    const excused = session.students.filter(s => s.status === 'excused').length;
    return { total, present, absent, late, excused };
  };

  if (!currentSession) {
    return (
      <div className="space-y-6">
        <form onSubmit={startNewSession} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo/Clase</label>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Ej: 3°A, Grupo 201"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Iniciar Pase de Lista
          </button>
        </form>

        {sessions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Historial de Asistencias</h4>
            {sessions.map(session => {
              const stats = getSessionStats(session);
              return (
                <div key={session.id} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-bold text-gray-900">{session.group}</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                      <div className="text-xs text-gray-600">Presentes</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                      <div className="text-xs text-gray-600">Ausentes</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                      <div className="text-xs text-gray-600">Retardos</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                      <div className="text-xs text-gray-600">Justificados</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-2">Pasando lista: {currentSession.group}</h4>
        <p className="text-sm text-gray-600">
          {new Date(currentSession.date).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <form onSubmit={addStudent} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del estudiante</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nombre completo"
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

      {currentSession.students.length > 0 && (
        <div className="space-y-3">
          {currentSession.students.map(student => {
            const config = getStatusConfig(student.status);
            return (
              <div key={student.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{student.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => updateStudentStatus(student.id, 'present')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      student.status === 'present' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✓ Presente
                  </button>
                  <button
                    onClick={() => updateStudentStatus(student.id, 'absent')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      student.status === 'absent' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✗ Ausente
                  </button>
                  <button
                    onClick={() => updateStudentStatus(student.id, 'late')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      student.status === 'late' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⏰ Retardo
                  </button>
                  <button
                    onClick={() => updateStudentStatus(student.id, 'excused')}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      student.status === 'excused' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 Justificado
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={saveSession}
          className="flex-1 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Guardar Asistencia
        </button>
        <button
          onClick={() => setCurrentSession(null)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
