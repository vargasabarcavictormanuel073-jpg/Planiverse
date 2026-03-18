/**
 * ModuleCard - Tarjeta de selección de módulos
 * 
 * Componente que representa una tarjeta interactiva para seleccionar/deseleccionar
 * módulos de la aplicación (Tareas, Calendario, Notas, etc.).
 * 
 * Características:
 * - Diseño visual atractivo con iconos y descripciones
 * - Estado seleccionado/no seleccionado con colores dinámicos
 * - Animaciones suaves de hover y selección
 * - Checkmark visual cuando está seleccionado
 * - Accesibilidad completa (role="checkbox", aria-checked, keyboard navigation)
 * - Optimizado con React.memo para prevenir re-renders innecesarios
 */

'use client';

import { memo } from 'react';
import { Module, ModuleType } from './types';

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onToggle: (module: ModuleType) => void;
}

function ModuleCard({ module, isSelected, onToggle }: ModuleCardProps) {
  return (
    <button
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${module.name}: ${module.description}. ${isSelected ? 'Seleccionado' : 'No seleccionado'}. Presiona Enter o Espacio para ${isSelected ? 'deseleccionar' : 'seleccionar'}.`}
      onClick={() => onToggle(module.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(module.id);
        }
      }}
      style={
        isSelected
          ? {
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              color: 'white',
            }
          : undefined
      }
      className={`
        relative p-5 sm:p-6 md:p-7 rounded-lg border-2 transition-all duration-300
        focus:outline-none focus:ring-4 focus:ring-offset-2
        hover:scale-105 active:scale-95 hover:shadow-lg
        ${
          isSelected
            ? 'shadow-md'
            : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
        }
      `}
    >
      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
        <div 
          className={`text-3xl sm:text-4xl md:text-5xl transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100'}`}
          aria-hidden="true"
        >
          {module.icon}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold transition-colors duration-300">
          {module.name}
        </h3>
        <p 
          className="text-xs sm:text-sm md:text-base transition-colors duration-300"
          style={isSelected ? { color: 'rgba(255, 255, 255, 0.9)' } : undefined}
        >
          {module.description}
        </p>
      </div>
      
      {/* Indicador visual de selección */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-fade-in"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4"
            style={{ color: 'var(--color-primary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

// Memoizar el componente para prevenir re-renders innecesarios
// Solo se re-renderizará si module, isSelected o onToggle cambian
export default memo(ModuleCard);
