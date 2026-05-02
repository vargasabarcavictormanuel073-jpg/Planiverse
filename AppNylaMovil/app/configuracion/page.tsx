/**
 * Página de Configuración Principal
 * Ruta: /configuracion
 * 
 * Página índice que muestra todas las opciones de configuración disponibles.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';

export default function ConfiguracionPage() {
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

  const configOptions = [
    {
      id: 'perfil',
      title: 'Perfil',
      description: 'Edita tu información personal y preferencias',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      route: '/configuracion/perfil',
    },
    {
      id: 'modo-oscuro',
      title: 'Modo Oscuro',
      description: 'Activa o desactiva el tema oscuro',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-600',
      route: '/configuracion/modo-oscuro',
    },
    {
      id: 'ayuda',
      title: 'Ayuda',
      description: 'Obtén ayuda y soporte técnico',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600',
      route: '/configuracion/ayuda',
    },
    {
      id: 'historial-acceso',
      title: 'Historial de Acceso',
      description: 'Revisa los últimos inicios de sesión en tu cuenta',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      route: '/configuracion/historial-acceso',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Configuración
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Hola, {userName}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => router.push(option.route)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {option.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {option.description}
                </p>
                
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Abrir</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Tus datos están seguros
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                Toda tu información se guarda de forma segura y solo tú tienes acceso a ella. Puedes modificar tu configuración en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
