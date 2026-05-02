'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';
import { AdminAccessLogService, AccessLog, ADMIN_EMAIL } from '@/lib/services/AdminAccessLogService';
import { AuthService } from '@/firebase/services/auth.service';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;

    // Redirigir si no es admin
    if (!user) { router.push('/'); return; }
    if (user.email !== ADMIN_EMAIL) { router.push('/inicio'); return; }

    // Cargar logs
    AdminAccessLogService.getAll(200)
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => { setError('Error al cargar los registros'); setLoading(false); });
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Estadísticas
  const uniqueUsers = new Set(logs.map(l => l.email)).size;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = logs.filter(l => l.date.startsWith(today)).length;
  const googleCount = logs.filter(l => l.method === 'google').length;
  const emailCount = logs.filter(l => l.method === 'email').length;

  // Filtro de búsqueda
  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.email.toLowerCase().includes(q) ||
           l.device.toLowerCase().includes(q) ||
           l.platform.toLowerCase().includes(q);
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  const methodBadge = (method: AccessLog['method']) => {
    if (method === 'google') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-blue-300">🔵 Google</span>;
    if (method === 'email')  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-900 text-green-300">📧 Email</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-700 text-gray-300">❓ Desconocido</span>;
  };

  return (
    <div className="admin-page min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <h1 className="text-lg font-bold text-white">Panel de Administración</h1>
            <p className="text-xs text-gray-400">Planiverse · {user?.email}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await AuthService.logout();
            localStorage.clear();
            window.location.href = '/';
          }}
          className="text-sm text-red-400 hover:text-red-300 transition-colors font-semibold"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total accesos', value: logs.length, color: 'text-blue-400' },
            { label: 'Usuarios únicos', value: uniqueUsers, color: 'text-purple-400' },
            { label: 'Accesos hoy', value: todayCount, color: 'text-green-400' },
            { label: 'Via Google', value: googleCount, color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por correo, dispositivo o plataforma..."
            className="input-dark w-full px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors border"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Tabla de logs */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-white">Historial de Accesos</h2>
            <span className="text-xs text-gray-500">{filtered.length} registros</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-400">No hay registros de acceso todavía</p>
              <p className="text-gray-600 text-sm mt-2">Los accesos se registran automáticamente cuando los usuarios inician sesión</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                    <th className="px-6 py-3 text-left">Correo</th>
                    <th className="px-6 py-3 text-left">Método</th>
                    <th className="px-6 py-3 text-left">Dispositivo</th>
                    <th className="px-6 py-3 text-left">Plataforma</th>
                    <th className="px-6 py-3 text-left">Fecha</th>
                    <th className="px-6 py-3 text-left">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr
                      key={log.id || i}
                      className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-200 font-medium">{log.email}</td>
                      <td className="px-6 py-3">{methodBadge(log.method)}</td>
                      <td className="px-6 py-3 text-gray-400">{log.device}</td>
                      <td className="px-6 py-3 text-gray-400">
                        {log.platform === 'Android' || log.platform === 'iOS' ? '📱 ' : '💻 '}
                        {log.platform}
                      </td>
                      <td className="px-6 py-3 text-gray-400">{formatDate(log.date)}</td>
                      <td className="px-6 py-3 text-gray-400">{formatTime(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          Mostrando los últimos 200 registros · Solo accesible para {ADMIN_EMAIL}
        </p>
      </main>
    </div>
  );
}
