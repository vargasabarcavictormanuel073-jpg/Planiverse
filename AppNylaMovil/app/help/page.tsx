'use client';

import AppLayout from '@/components/layout/AppLayout';

const ERRORES_COMUNES = [
  {
    emoji: '🔐',
    titulo: 'No puedo iniciar sesión',
    descripcion: 'Verifica que tu correo y contraseña sean correctos. Si olvidaste tu contraseña, cierra la app, vuelve a abrirla y usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio.',
  },
  {
    emoji: '📧',
    titulo: 'No recibo el correo de verificación',
    descripcion: 'Revisa tu carpeta de spam o correo no deseado. Si no aparece, espera unos minutos e intenta reenviar el correo desde la pantalla de inicio de sesión.',
  },
  {
    emoji: '🌐',
    titulo: 'La app no carga o se queda en pantalla blanca',
    descripcion: 'Verifica tu conexión a internet. Si el problema persiste, recarga la página (en web) o cierra y vuelve a abrir la app. También puedes limpiar el caché del navegador.',
  },
  {
    emoji: '💾',
    titulo: 'Mis datos no se guardan',
    descripcion: 'Asegúrate de tener conexión a internet al guardar. Los datos se sincronizan con la nube en tiempo real. Si usas modo privado/incógnito, los datos no se guardarán localmente.',
  },
  {
    emoji: '🎨',
    titulo: 'Los colores de la app no cambian según mi rol',
    descripcion: 'Recarga la página una vez después de iniciar sesión. Los colores se aplican automáticamente según tu rol (Estudiante, Maestro u Otro) al cargar la aplicación.',
  },
  {
    emoji: '🔔',
    titulo: 'No recibo notificaciones',
    descripcion: 'Asegúrate de haber aceptado los permisos de notificaciones cuando la app lo solicitó. En tu dispositivo, ve a Configuración > Notificaciones > Planiverse y actívalas.',
  },
  {
    emoji: '📱',
    titulo: 'La app no se instala en mi celular',
    descripcion: 'Planiverse es una PWA (app web progresiva). En Android, abre la app en Chrome y toca "Agregar a pantalla de inicio". En iPhone, usa Safari y toca el botón Compartir > "Añadir a pantalla de inicio".',
  },
  {
    emoji: '🔄',
    titulo: 'La app muestra información desactualizada',
    descripcion: 'Recarga la página o cierra y vuelve a abrir la app. Si el problema persiste, cierra sesión, vuelve a iniciarla y los datos se sincronizarán desde la nube.',
  },
  {
    emoji: '❌',
    titulo: 'Error al crear mi cuenta',
    descripcion: 'Verifica que tu correo sea válido y que la contraseña tenga al menos 6 caracteres. Si el correo ya está registrado, intenta iniciar sesión en lugar de crear una cuenta nueva.',
  },
  {
    emoji: '🚪',
    titulo: 'No puedo cerrar sesión',
    descripcion: 'Abre el menú lateral (ícono de tres líneas arriba a la izquierda) y toca "Cerrar sesión" al final del menú. Si no funciona, limpia el caché del navegador.',
  },
];

export default function HelpPage() {
  return (
    <AppLayout title="Ayuda">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Encabezado */}
        <div className="text-center py-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            🆘
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Centro de Ayuda
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Encuentra soluciones a los problemas más comunes
          </p>
        </div>

        {/* Errores comunes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <span>⚠️</span> Problemas Frecuentes
          </h3>
          <div className="space-y-4">
            {ERRORES_COMUNES.map((error, i) => (
              <details
                key={i}
                className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors list-none">
                  <span className="text-2xl">{error.emoji}</span>
                  <span className="flex-1 font-semibold text-gray-900 dark:text-gray-100">
                    {error.titulo}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {error.descripcion}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contacto a soporte */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span>📞</span> Contactar Soporte
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ¿No encontraste solución? Nuestro equipo está listo para ayudarte.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Email */}
            <a
              href="mailto:sistemsvlu@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                📧
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Correo</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">sistemsvlu@gmail.com</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Respuesta en 24 hrs</p>
              </div>
            </a>
          </div>

          {/* Horario */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              🕐 Horario de atención: Lunes a Viernes, 9:00 AM – 6:00 PM (hora México)
            </p>
          </div>
        </div>

        {/* Versión */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          Planiverse v1.0.0 · Hecho con ❤️ para estudiantes y maestros
        </p>
      </div>
    </AppLayout>
  );
}
