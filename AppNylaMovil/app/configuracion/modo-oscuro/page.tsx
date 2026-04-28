/**
 * Página de Configuración de Modo Oscuro
 * Ruta: /modo-oscuro
 * 
 * Permite al usuario activar/desactivar el modo oscuro
 * y ver información sobre esta funcionalidad.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ModoOscuroPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar preferencia de modo oscuro
    const darkMode = localStorage.getItem('planiverse_dark_mode') === 'true';
    setIsDarkMode(darkMode);
    setIsLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Guardar en localStorage
    localStorage.setItem('planiverse_dark_mode', String(newDarkMode));
    
    // Aplicar o remover clase dark del documento
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            {isDarkMode ? (
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Modo Oscuro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia visual
          </p>
        </div>

        {/* Toggle principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isDarkMode ? 'Modo Oscuro Activado' : 'Modo Claro Activado'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isDarkMode
                  ? 'Reduce la fatiga visual en ambientes con poca luz'
                  : 'Ideal para ambientes bien iluminados'}
              </p>
            </div>
            
            {/* Switch toggle */}
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-14 w-28 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                isDarkMode
                  ? 'bg-indigo-600 focus:ring-indigo-500'
                  : 'bg-gray-300 focus:ring-gray-400'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-16' : 'translate-x-2'
                }`}
              >
                {isDarkMode ? (
                  <svg
                    className="w-10 h-10 text-indigo-600 p-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10 text-yellow-500 p-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Beneficios del Modo Oscuro
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Reduce la Fatiga Visual
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Menos brillo en pantalla significa menos cansancio para tus ojos, especialmente en ambientes con poca luz.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ahorra Batería
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  En pantallas OLED y AMOLED, el modo oscuro puede ayudar a prolongar la duración de la batería.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Mejor para la Noche
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Perfecto para usar la aplicación antes de dormir sin afectar tu ciclo de sueño.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Estilo Moderno
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Un diseño elegante y contemporáneo que muchos usuarios prefieren.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Vista Previa
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tarjeta de ejemplo */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Planiverse</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tu organizador personal</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Así se verán tus tarjetas y contenido en {isDarkMode ? 'modo oscuro' : 'modo claro'}.
              </p>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Botón de ejemplo
              </button>
            </div>

            {/* Lista de ejemplo */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-300">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tareas de ejemplo</h3>
              <ul className="space-y-3">
                {['Completar proyecto', 'Revisar notas', 'Estudiar para examen'].map((task, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 rounded" />
                    <span className="text-gray-700 dark:text-gray-300">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 transition-colors duration-300">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Tu preferencia se guarda automáticamente
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                El modo oscuro se aplicará en todas las páginas de Planiverse y se mantendrá activo incluso después de cerrar la aplicación.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
