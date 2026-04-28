/**
 * Página de Ayuda - Accesible sin autenticación
 */

'use client';

import { useRouter } from 'next/navigation';

export default function AyudaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Centro de Ayuda
          </h1>
          <p className="text-gray-500 text-sm">
            Encuentra respuestas a las preguntas más frecuentes
          </p>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="space-y-5">
          {/* Sección: Cuenta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs text-gray-400">
              Cuenta
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Cómo inicio sesión?
                </h3>
                <p className="text-gray-600 text-sm">
                  Inicia sesión con tu cuenta de Google. Toca "Continuar con Google" en la pantalla de autenticación.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Qué pasa si cierro sesión?
                </h3>
                <p className="text-gray-600 text-sm">
                  Puedes cerrar sesión desde configuración. La próxima vez que entres, inicia sesión de nuevo con Google.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Módulos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">
              Módulos
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Qué módulos están disponibles?
                </h3>
                <p className="text-gray-600 text-sm">
                  Planiverse incluye: Tareas, Notas, Calendario, Rutinas, Recordatorios y Herramientas educativas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Cómo accedo a los módulos?
                </h3>
                <p className="text-gray-600 text-sm">
                  Desde el inicio toca "Ver todos los módulos", o usa el menú de navegación superior.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Soporte */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">
              Soporte
            </h2>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                ¿Cómo reporto un problema?
              </h3>
              <p className="text-gray-600 text-sm">
                Si encuentras algún problema, contacta al equipo de soporte a través del correo de tu institución.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
