'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/firebase/services/auth.service';
import { ThemeService } from '@/lib/services/ThemeService';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Inicializar isDark desde el DOM (fuente de verdad) no solo localStorage
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Leer el estado real del DOM al montar
    const darkInDom = document.documentElement.classList.contains('dark');
    const darkInStorage = ThemeService.isDarkMode();
    
    // Si hay desincronización, corregir
    if (darkInStorage && !darkInDom) {
      document.documentElement.classList.add('dark');
    } else if (!darkInStorage && darkInDom) {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDark(darkInStorage);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const toggleDarkMode = () => {
    const newValue = ThemeService.toggleDarkMode();
    setIsDark(newValue);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <a 
              href="/inicio" 
              className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              Planiverse
            </a>
            
            <span className="text-gray-400">|</span>
            
            <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h1>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {isDark ? (
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside
            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  // Inicializar role desde localStorage
  const [role] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('planiverse_role') || '';
  });

  const handleLogout = async () => {
    try {
      // Cerrar sesión de Firebase
      await AuthService.logout();
      
      // Limpiar localStorage
      localStorage.clear();
      
      // Redirigir al inicio
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así limpiar y redirigir
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <a 
            href="/inicio" 
            className="text-xl font-bold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            Planiverse
          </a>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Perfil</h3>
          <a
            href="/configuracion/perfil"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            Perfil
          </a>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Módulos</h3>
          <div className="space-y-1">
            <a
              href="/inicio"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Inicio
            </a>
            <a
              href="/modulos/tareas"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              {role === 'teacher' ? 'Planeaciones' : 'Tareas'}
            </a>
            <a
              href="/modulos/calendario"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Calendario
            </a>
            <a
              href="/modulos/rutinas"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Rutinas
            </a>
            <a
              href="/modulos/notas"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Notas
            </a>
            <a
              href="/modulos/recordatorios"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Recordatorios
            </a>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Soporte</h3>
          <a
            href="/ayuda"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            ❓ Ayuda y Errores
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
