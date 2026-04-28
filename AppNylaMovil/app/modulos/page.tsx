/**
 * Página de Módulos Principal
 * Ruta: /modulos
 * 
 * Página índice que muestra todos los módulos disponibles de la aplicación.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';

export default function ModulosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    // Obtener nombre del usuario
    const session = LocalStorageManager.getSession();
    if (session) {
      const profile = LocalStorageManager.getProfile(session.userId);
      if (profile && profile.fullName) {
        setUserName(profile.fullName);
      }
    }
  }, []);

  const modulos = [
    {
      id: 'tareas',
      title: 'Tareas',
      description: 'Gestiona tus tareas pendientes y completadas',
      icon: '✅',
      color: 'from-blue-500 to-blue-600',
      route: '/modulos/tareas',
    },
    {
      id: 'calendario',
      title: 'Calendario',
      description: 'Visualiza y organiza tus eventos',
      icon: '📅',
      color: 'from-purple-500 to-purple-600',
      route: '/modulos/calendario',
    },
    {
      id: 'notas',
      title: 'Notas',
      description: 'Escribe y organiza tus notas',
      icon: '📝',
      color: 'from-yellow-500 to-orange-600',
      route: '/modulos/notas',
    },
    {
      id: 'recordatorios',
      title: 'Recordatorios',
      description: 'Configura recordatorios importantes',
      icon: '⏰',
      color: 'from-red-500 to-pink-600',
      route: '/modulos/recordatorios',
    },
    {
      id: 'rutinas',
      title: 'Rutinas',
      description: 'Gestiona tus rutinas diarias',
      icon: '🔄',
      color: 'from-green-500 to-emerald-600',
      route: '/modulos/rutinas',
    },
    {
      id: 'herramientas',
      title: 'Herramientas',
      description: 'Accede a herramientas educativas',
      icon: '🛠️',
      color: 'from-indigo-500 to-blue-600',
      route: '/modulos/herramientas',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/inicio')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Módulos de Planiverse
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Selecciona el módulo que deseas usar, {userName}
            </p>
          </div>
        </div>

        {/* Grid de módulos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((modulo, index) => (
            <button
              key={modulo.id}
              onClick={() => router.push(modulo.route)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${modulo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {modulo.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {modulo.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {modulo.description}
                </p>
                
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                  <span>Abrir</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Todos tus datos están sincronizados
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                Los cambios que realices en cualquier módulo se guardan automáticamente y están disponibles en todos tus dispositivos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
