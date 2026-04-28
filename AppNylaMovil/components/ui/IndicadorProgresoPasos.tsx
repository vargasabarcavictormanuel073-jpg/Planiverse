/**
 * StepIndicator - Indicador visual de progreso del wizard
 * 
 * Componente que muestra el progreso del usuario a través de los 4 pasos del wizard.
 * Incluye:
 * - Círculos numerados para cada paso
 * - Checkmarks para pasos completados
 * - Resaltado del paso actual
 * - Líneas conectoras entre pasos
 * - Etiquetas descriptivas (visibles en tablet y desktop)
 * - Animaciones suaves de transición
 * - Soporte completo de accesibilidad (ARIA labels)
 */

import type { WizardStep } from '@/lib/auth/types';

interface StepIndicatorProps {
  currentStep: WizardStep;
  totalSteps: 4;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { number: 1 as WizardStep, label: 'Autenticación' },
    { number: 2 as WizardStep, label: 'Registro' },
    { number: 3 as WizardStep, label: 'Datos' },
    { number: 4 as WizardStep, label: 'Rol' }
  ];

  return (
    <nav aria-label="Progreso del wizard" className="w-full max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10">
      <ol className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li
              key={step.number}
              className="flex items-center flex-1"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Círculo del paso */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                    text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ease-in-out
                    ${
                      isCompleted
                        ? 'bg-purple-500 text-white scale-100'
                        : isCurrent
                        ? 'bg-white/20 text-white ring-4 ring-white/30 scale-110 border-2 border-white/60'
                        : 'bg-white/10 text-white/40 border border-white/20 scale-100'
                    }
                  `}
                  aria-label={`Paso ${step.number}: ${step.label}${isCompleted ? ' completado' : isCurrent ? ' actual' : ''}`}
                  role="img"
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-in fade-in zoom-in duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Etiqueta del paso (solo visible en tablet y desktop) */}
                <span
                  className={`
                    mt-2 text-xs sm:text-sm md:text-base font-medium hidden sm:block transition-colors duration-300
                    ${isCurrent ? 'text-white' : isCompleted ? 'text-white/70' : 'text-white/40'}
                  `}
                  aria-hidden="true"
                >
                  {step.label}
                </span>
              </div>

              {/* Línea conectora (no mostrar después del último paso) */}
              {step.number < totalSteps && (
                <div
                  className={`
                    h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 md:mx-3 transition-all duration-500 ease-in-out
                    ${isCompleted ? 'bg-purple-500' : 'bg-white/20'}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
