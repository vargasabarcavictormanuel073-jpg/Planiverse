/**
 * Página de Error de Cuenta
 * Se muestra cuando la cuenta fue eliminada pero la sesión sigue activa
 */

'use client';

import { useRouter } from 'next/navigation';

export default function ErrorCuentaPage() {
  const router = useRouter();

  const handleLimpiarSesion = () => {
    // Limpiar TODO el localStorage
    localStorage.clear();
    // Limpiar sessionStorage también
    sessionStorage.clear();
    // Redirigir a autenticación
    router.push('/autenticacion');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cuenta No Encontrada
        </h1>
        
        <p className="text-gray-600 mb-6">
          Parece que tu cuenta fue eliminada pero la sesión sigue activa en tu navegador.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>¿Qué pasó?</strong><br />
            La cuenta de Firebase fue eliminada pero los datos locales no se limpiaron correctamente.
          </p>
        </div>

        <button
          onClick={handleLimpiarSesion}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-3"
        >
          Limpiar Sesión y Volver a Iniciar
        </button>

        <a
          href="/debug"
          className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Ir a Página de Debug
        </a>
      </div>
    </div>
  );
}
