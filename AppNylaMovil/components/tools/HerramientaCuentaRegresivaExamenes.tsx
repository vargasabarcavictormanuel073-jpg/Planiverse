/**
 * ExamCountdown - Contador de días para exámenes
 */

'use client';

import { useState } from 'react';

interface Exam {
  id: string;
  name: string;
  date: string;
  subject: string;
}

export default function ExamCountdown() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');

  const addExam = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: Exam = {
      id: Date.now().toString(),
      name,
      date,
      subject,
    };
    setExams([...exams, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setName('');
    setDate('');
    setSubject('');
  };

  const removeExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  const getDaysUntil = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diff = exam.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
    if (days === 0) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    if (days <= 3) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' };
    if (days <= 7) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
    return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 0) return '✅ Completado';
    if (days === 0) return '🔴 ¡HOY!';
    if (days === 1) return '🟠 Mañana';
    if (days <= 3) return '🟡 Muy pronto';
    if (days <= 7) return '🟢 Esta semana';
    return '🔵 Próximamente';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addExam} className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del examen</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Examen final de Matemáticas"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              required
            />
          </div>
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
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha del examen</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Agregar Examen
        </button>
      </form>

      <div className="space-y-4">
        {exams.map((exam) => {
          const daysUntil = getDaysUntil(exam.date);
          const colors = getUrgencyColor(daysUntil);
          const label = getUrgencyLabel(daysUntil);

          return (
            <div key={exam.id} className={`bg-white rounded-xl p-6 border-2 ${colors.border} relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 px-4 py-1 ${colors.bg} ${colors.text} text-xs font-bold rounded-bl-lg`}>
                {label}
              </div>
              
              <div className="flex items-start justify-between gap-4 mt-6">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h4>
                  <p className="text-gray-600 mb-3">📚 {exam.subject}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${colors.text}`}>
                        {daysUntil < 0 ? '✓' : daysUntil}
                      </div>
                      <div className="text-sm text-gray-600">
                        {daysUntil < 0 ? 'Pasado' : daysUntil === 1 ? 'día' : 'días'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Fecha:</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(exam.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeExam(exam.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Agrega tus exámenes para ver cuántos días faltan</p>
        </div>
      )}
    </div>
  );
}
