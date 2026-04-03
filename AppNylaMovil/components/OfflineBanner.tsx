'use client';

import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setShowBack(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      // Ocultar el mensaje de "volvió internet" después de 3 segundos
      setTimeout(() => setShowBack(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Sin internet
  if (!isOnline) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in pointer-events-auto">
          <span className="text-lg">📵</span>
          <span>Sin conexión — tus cambios se guardarán cuando vuelva el internet</span>
        </div>
      </div>
    );
  }

  // Volvió el internet
  if (showBack) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in pointer-events-auto">
          <span className="text-lg">✅</span>
          <span>Conexión restaurada</span>
        </div>
      </div>
    );
  }

  return null;
}
