/**
 * Página de Ayuda - Accesible sin autenticación (desde el login)
 */

'use client';

import { useRouter } from 'next/navigation';

const FAQS = [
  {
    emoji: '🔐',
    titulo: '¿Cómo inicio sesión?',
    descripcion: 'Toca "Continuar con Google" y selecciona tu cuenta. No necesitas contraseña, solo tu cuenta de Google.',
  },
  {
    emoji: '📵',
    titulo: 'La app se queda cargando infinito',
    descripcion: 'Esto puede pasar si cerraste la app mientras se guardaban datos. Abre las herramientas del navegador (F12), ve a Application → Storage y toca "Clear site data". Luego recarga.',
  },
  {
    emoji: '💾',
    titulo: '¿Para qué sirve el caché?',
    descripcion: 'El caché guarda tus datos localmente para que la app cargue más rápido sin internet. Si ves información desactualizada o errores raros, limpiar el caché suele solucionarlo.',
  },
  {
    emoji: '🔄',
    titulo: 'Mis datos no se guardan',
    descripcion: 'Asegúrate de tener conexión a internet al guardar. Los datos se sincronizan con la nube en tiempo real. Si usas modo incógnito, los datos locales no se conservarán al cerrar.',
  },
  {
    emoji: '📱',
    titulo: '¿Cómo instalo la app en mi celular?',
    descripcion: 'Planiverse es una PWA. En Android abre Chrome y toca "Agregar a pantalla de inicio". En iPhone usa Safari, toca el botón Compartir y selecciona "Añadir a pantalla de inicio".',
  },
  {
    emoji: '🎨',
    titulo: 'Los colores no cambian según mi rol',
    descripcion: 'Recarga la página una vez después de iniciar sesión. Los colores se aplican automáticamente según tu rol (Estudiante, Maestro u Otro).',
  },
  {
    emoji: '🔔',
    titulo: 'No recibo notificaciones',
    descripcion: 'Asegúrate de haber aceptado los permisos cuando la app lo solicitó. En tu dispositivo ve a Configuración → Notificaciones → Planiverse y actívalas.',
  },
  {
    emoji: '🚪',
    titulo: 'Borré mi cuenta pero sigo viendo la app',
    descripcion: 'Si eliminaste tu cuenta de Google o de Firebase sin cerrar sesión, la sesión queda atrapada. Abre la consola del navegador (F12) y ejecuta: localStorage.clear(); location.href="/autenticacion"',
  },
];

export default function AyudaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🆘
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Centro de Ayuda</h1>
          <p className="text-gray-500 text-sm">Soluciones a los problemas más comunes de Planiverse</p>
        </div>

        <div className="space-y-4">

          {/* FAQs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                    <span className="text-xl">{faq.emoji}</span>
                    <span className="flex-1 font-semibold text-gray-800 text-sm">{faq.titulo}</span>
                    <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-1 bg-gray-50">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.descripcion}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Tip de caché */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-amber-800 text-sm mb-1">Tip: Limpia el caché si algo falla</p>
                <p className="text-amber-700 text-sm">
                  El 90% de los errores raros se resuelven limpiando el caché. En Chrome: <strong>Ctrl+Shift+Delete</strong> → selecciona "Imágenes y archivos en caché" → Borrar datos.
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">¿Necesitas más ayuda?</h2>
            <a
              href="mailto:sistemsvlu@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                📧
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Correo de soporte</p>
                <p className="text-blue-600 text-sm">sistemsvlu@gmail.com</p>
                <p className="text-xs text-gray-400 mt-0.5">Respuesta en 24 hrs · Lun–Vie 9am–6pm (México)</p>
              </div>
            </a>
          </div>

          <p className="text-center text-xs text-gray-400 pb-4">
            Planiverse v1.0.0 · Hecho con ❤️ para estudiantes y maestros
          </p>
        </div>
      </div>
    </div>
  );
}
