/**
 * ScheduleGenerator - Generador de horario semanal
 */

'use client';

import { useState } from 'react';

interface ClassSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}

export default function ScheduleGenerator() {
  const [schedule, setSchedule] = useState<ClassSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState('Lunes');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const timeSlots = [
    '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
    '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
    '15:00 - 16:00', '16:00 - 17:00'
  ];

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: ClassSlot = {
      id: Date.now().toString(),
      day,
      time,
      subject,
      teacher,
      room,
    };
    setSchedule([...schedule, newClass]);
    setSubject('');
    setTeacher('');
    setRoom('');
    setShowForm(false);
  };

  const removeClass = (id: string) => {
    setSchedule(schedule.filter(c => c.id !== id));
  };

  const getClassForSlot = (day: string, time: string) => {
    return schedule.find(c => c.day === day && c.time === time);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Mi Horario Semanal</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {showForm ? 'Cancelar' : '+ Agregar Clase'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addClass} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Día</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Horario</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
                required
              >
                <option value="">Selecciona horario</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profesor (opcional)</label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Nombre del profesor"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salón (opcional)</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej: Aula 201"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-current transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Agregar al Horario
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold">Horario</th>
              {days.map(day => (
                <th key={day} className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-semibold">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="border-2 border-gray-300 bg-gray-50 p-3 font-medium text-sm">{time}</td>
                {days.map(day => {
                  const classSlot = getClassForSlot(day, time);
                  return (
                    <td key={`${day}-${time}`} className="border-2 border-gray-300 p-2">
                      {classSlot ? (
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 relative group" style={{ borderColor: 'var(--color-primary)' }}>
                          <button
                            onClick={() => removeClass(classSlot.id)}
                            className="absolute top-1 right-1 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-primary)' }}>{classSlot.subject}</div>
                          {classSlot.teacher && <div className="text-xs text-gray-600">👨‍🏫 {classSlot.teacher}</div>}
                          {classSlot.room && <div className="text-xs text-gray-600">🚪 {classSlot.room}</div>}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
