/**
 * PomodoroTimer - Temporizador Pomodoro para estudio
 * 25 minutos de trabajo, 5 minutos de descanso
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const playSound = useCallback(() => {
    // Crear un beep simple
    try {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      
      if (!AudioContextClass) return;
      
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch {
      console.log('Audio no disponible');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Tiempo completado
            playSound();
            if (isBreak) {
              // Fin del descanso, volver a trabajo
              setMinutes(25);
              setIsBreak(false);
              setIsActive(false);
            } else {
              // Fin del trabajo, iniciar descanso
              setCompletedPomodoros(prev => prev + 1);
              setMinutes(5);
              setIsBreak(true);
              setIsActive(false);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak, playSound]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const skipToBreak = () => {
    setIsActive(false);
    setIsBreak(true);
    setMinutes(5);
    setSeconds(0);
  };

  const skipToWork = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const progress = isBreak 
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block p-8 rounded-full mb-6" style={{ 
          background: `conic-gradient(var(--color-primary) ${progress}%, #e5e7eb ${progress}%)` 
        }}>
          <div className="bg-white rounded-full p-8">
            <div className="text-7xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isBreak ? '☕ Tiempo de Descanso' : '📚 Tiempo de Estudio'}
          </h3>
          <p className="text-gray-600">
            {isBreak 
              ? 'Relájate y descansa un poco' 
              : 'Concéntrate en tu tarea'}
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggle}
            className="px-8 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isActive ? '⏸️ Pausar' : '▶️ Iniciar'}
          </button>
          <button
            onClick={reset}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            🔄 Reiniciar
          </button>
        </div>

        <div className="flex justify-center gap-4">
          {!isBreak && (
            <button
              onClick={skipToBreak}
              className="px-4 py-2 text-sm bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-current transition-colors"
            >
              Saltar a descanso
            </button>
          )}
          {isBreak && (
            <button
              onClick={skipToWork}
              className="px-4 py-2 text-sm bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-current transition-colors"
            >
              Saltar a trabajo
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">📊 Estadísticas de Hoy</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {completedPomodoros}
            </div>
            <div className="text-sm text-gray-600">Pomodoros completados</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {completedPomodoros * 25}
            </div>
            <div className="text-sm text-gray-600">Minutos de estudio</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 ¿Qué es la técnica Pomodoro?</h4>
        <p className="text-sm text-blue-800">
          La técnica Pomodoro consiste en trabajar durante 25 minutos concentrado en una tarea, 
          seguido de un descanso de 5 minutos. Esto ayuda a mantener la concentración y evitar el agotamiento.
        </p>
      </div>
    </div>
  );
}
