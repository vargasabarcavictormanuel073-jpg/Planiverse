'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { AccessHistoryService, AccessRecord } from '@/lib/services/AccessHistoryService';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';

export default function HistorialAccesoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    setRecords(AccessHistoryService.getAll());
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const handleClear = () => {
    AccessHistoryService.clear();
    setRecords([]);
    setShowConfirmClear(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getMethodLabel = (method: AccessRecord['method']) => {
    switch (method) {
      case 'google': return { label: 'Google', color: '#4285F4', icon: '🔵' };
      case 'email':  return { label: 'Email', color: '#10B981', icon: '📧' };
      default:       return { label: 'Desconocido', color: '#6B7280', icon: '❓' };
    }
  };

  return (
    <AppLayout title="Historial de Acceso">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--color-primary)', opacity: 0.15 }}>
                🔐
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historial de Acceso</h2>
                <p className="text-sm text-gray-500">Últimos {records.length} accesos registrados</p>
              </div>
            </div>
            {records.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Confirmación de limpieza */}
        {showConfirmClear && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800 font-semibold mb-3">¿Eliminar todo el historial de acceso?</p>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de accesos */}
        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <p className="text-gray-500 text-lg font-semibold">Sin registros de acceso</p>
            <p className="text-gray-400 text-sm mt-2">
              Los accesos se registran automáticamente cada vez que inicias sesión.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const method = getMethodLabel(record.method);
              const isFirst = index === 0;
              return (
                <div
                  key={record.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all ${
                    isFirst ? 'border-green-300' : 'border-gray-200'
                  }`}
                >
                  {isFirst && (
                    <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2">
                      Acceso más reciente
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Icono dispositivo */}
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                        {record.platform === 'Android' || record.platform === 'iOS' ? '📱' : '💻'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {record.device} · {record.platform}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: method.color }}>
                            {method.icon} {method.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-700">{formatTime(record.date)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(record.date)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nota de privacidad */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700">
            🔒 El historial se guarda solo en este dispositivo. Máximo 20 registros.
            Si ves un acceso que no reconoces, cambia tu contraseña inmediatamente.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
