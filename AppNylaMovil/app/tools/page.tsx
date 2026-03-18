/**
 * ToolsPage - Página de herramientas según el rol del usuario
 * Herramientas específicas para estudiantes y maestros
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';

// Componentes de herramientas
import GradeCalculator from '@/components/tools/GradeCalculator';
import PomodoroTimer from '@/components/tools/PomodoroTimer';
import ScheduleGenerator from '@/components/tools/ScheduleGenerator';
import SuppliesList from '@/components/tools/SuppliesList';
import ExamCountdown from '@/components/tools/ExamCountdown';
import AttendanceList from '@/components/tools/AttendanceList';
import RubricGenerator from '@/components/tools/RubricGenerator';
import ActivityBank from '@/components/tools/ActivityBank';
import EvaluationCalendar from '@/components/tools/EvaluationCalendar';
import GroupStats from '@/components/tools/GroupStats';

export default function ToolsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // Inicializar role desde localStorage
  const [role, setRole] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('planiverse_role') || '';
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/');
      return;
    }
    
    // Solo actualizar si el valor cambió
    if (typeof window !== 'undefined') {
      const roleData = localStorage.getItem('planiverse_role');
      if (roleData && roleData !== role) {
        // Usar setTimeout para evitar setState durante render
        setTimeout(() => setRole(roleData), 0);
      }
    }
  }, [router, user, authLoading]); // Removido 'role' de las dependencias

  if (authLoading) {
    return (
      <AppLayout title="Herramientas">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const studentTools = [
    { id: 'calculator', name: 'Calculadora de Promedio', icon: '🧮', description: 'Calcula tu promedio académico', component: GradeCalculator },
    { id: 'pomodoro', name: 'Temporizador Pomodoro', icon: '⏱️', description: 'Técnica de estudio 25/5 minutos', component: PomodoroTimer },
    { id: 'schedule', name: 'Generador de Horarios', icon: '📅', description: 'Crea tu horario semanal', component: ScheduleGenerator },
    { id: 'supplies', name: 'Lista de Útiles', icon: '✏️', description: 'Checklist de materiales', component: SuppliesList },
    { id: 'countdown', name: 'Contador de Días', icon: '⏳', description: 'Días para exámenes importantes', component: ExamCountdown },
  ];

  const teacherTools = [
    { id: 'attendance', name: 'Lista de Asistencia', icon: '✅', description: 'Pasar lista por grupo', component: AttendanceList },
    { id: 'rubric', name: 'Generador de Rúbricas', icon: '📊', description: 'Crea rúbricas de evaluación', component: RubricGenerator },
    { id: 'activities', name: 'Banco de Actividades', icon: '📚', description: 'Guarda actividades reutilizables', component: ActivityBank },
    { id: 'evaluations', name: 'Calendario de Evaluaciones', icon: '📆', description: 'Programa evaluaciones', component: EvaluationCalendar },
    { id: 'stats', name: 'Estadísticas de Grupo', icon: '📈', description: 'Progreso del grupo', component: GroupStats },
  ];

  const tools = role === 'teacher' ? teacherTools : studentTools;
  const selectedToolData = tools.find(t => t.id === selectedTool);

  return (
    <AppLayout title="Herramientas">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🛠️ Herramientas {role === 'teacher' ? 'para Maestros' : 'para Estudiantes'}
        </h1>
        <p className="text-lg text-gray-600">
          {role === 'teacher' 
            ? 'Herramientas diseñadas para facilitar tu labor docente' 
            : 'Herramientas para mejorar tu organización y rendimiento académico'}
        </p>
      </div>

      {!selectedTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-xl hover:scale-105 hover:border-current transition-all duration-300 text-left animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-current transition-colors" style={{ color: 'var(--color-primary)' }}>
                {tool.name}
              </h3>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                Abrir herramienta
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-scale-in">
          <button
            onClick={() => setSelectedTool(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a herramientas
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="text-5xl">{selectedToolData?.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedToolData?.name}</h2>
                <p className="text-gray-600">{selectedToolData?.description}</p>
              </div>
            </div>
            
            {selectedToolData && <selectedToolData.component />}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
