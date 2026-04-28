/**
 * Página de Ayuda
 */

'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';

export default function AyudaPage() {
  const router = useRouter();

  return (
    <AppLayout title="Ayuda">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/inicio')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centro de Ayuda
          </h1>
          <p className="text-gray-600">
            Encuentra respuestas a las preguntas más frecuentes
          </p>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="space-y-6">
          {/* Sección: Cuenta */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cuenta
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Cómo inicio sesión?
                </h3>
                <p className="text-gray-600">
                  Inicia sesión con tu cuenta de Google. Haz clic en "Continuar con Google" en la pantalla de autenticación.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Qué pasa si cierro sesión?
                </h3>
                <p className="text-gray-600">
                  Puedes cerrar sesión desde el menú de configuración. La próxima vez que entres, inicia sesión de nuevo con Google.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Módulos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Módulos
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Qué módulos están disponibles?
                </h3>
                <p className="text-gray-600">
                  Planiverse incluye: Tareas, Notas, Calendario, Rutinas, Recordatorios y Herramientas educativas.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Cómo accedo a los módulos?
                </h3>
                <p className="text-gray-600">
                  Desde el inicio toca "Ver todos los módulos", o usa el menú de navegación superior.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Soporte */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Soporte
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Cómo reporto un problema?
                </h3>
                <p className="text-gray-600">
                  Si encuentras algún problema, contacta al equipo de soporte a través del correo de tu institución.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
