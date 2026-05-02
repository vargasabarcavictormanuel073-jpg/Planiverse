/**
 * AppLayout - Componente de layout principal para páginas autenticadas
 * Módulo: Layout / Estructura
 *
 * Envuelve todas las páginas internas de la app (dashboard, tareas, calendario, etc.)
 * Incluye la barra superior (Topbar), banner offline y el contenido de la página.
 * Solo debe usarse en páginas que requieren autenticación.
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Topbar from './BarraNavegacionSuperior';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Mostrar brevemente el mensaje de reconexión y luego ocultarlo
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title={title} />

      {/* Banner de estado de conexión */}
      {showBanner && (
        <div
          className={`fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-gray-900'
          }`}
        >
          {isOnline ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Conexión restaurada — tus datos se están sincronizando
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 01-7.072-7.072" />
              </svg>
              Sin conexión — mostrando datos guardados. Los cambios se sincronizarán cuando vuelva la conexión.
            </>
          )}
        </div>
      )}

      <main className={`pt-16 px-4 md:px-8 py-8 max-w-7xl mx-auto ${showBanner ? 'mt-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}
