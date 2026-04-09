/**
 * CacheStats - Componente para mostrar estadísticas del caché
 * Útil para debugging y monitoreo
 */

'use client';

import { useState, useEffect } from 'react';
import { CacheService } from '@/lib/services/CacheService';

interface CacheStatsData {
  size: number;
  entries: number;
  sizeInMB: number;
}

export default function CacheStats() {
  const [stats, setStats] = useState<CacheStatsData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = CacheService.getStats();
      setStats(cacheStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar el caché? Esto puede ralentizar la app temporalmente.')) {
      await CacheService.clear();
      setStats({ size: 0, entries: 0, sizeInMB: 0 });
    }
  };

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💾</span> Caché Local
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Ocultar' : 'Detalles'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Tamaño</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{stats.sizeInMB} MB</p>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Entradas</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{stats.entries}</p>
        </div>
        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">Estado</p>
          <p className="font-bold text-green-600 dark:text-green-400">✓ Activo</p>
        </div>
      </div>

      {showDetails && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400">
          <p>El caché almacena tus datos localmente para:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Cargar datos instantáneamente</li>
            <li>Funcionar sin conexión</li>
            <li>Reducir uso de datos</li>
            <li>Mejorar la velocidad de la app</li>
          </ul>
        </div>
      )}

      <button
        onClick={handleClearCache}
        className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
      >
        🗑️ Limpiar caché
      </button>
    </div>
  );
}
