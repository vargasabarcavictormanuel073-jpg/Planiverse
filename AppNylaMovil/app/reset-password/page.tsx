'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      setErrorMsg('El enlace no es válido o ya expiró.');
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('El enlace expiró o ya fue usado. Solicita uno nuevo.');
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      // Cerrar sesión activa para que Firebase reconozca la nueva contraseña
      try { await signOut(auth); } catch { /* ignorar */ }
      // Limpiar localStorage para forzar login fresco
      try {
        localStorage.removeItem('planiverse_session');
        localStorage.removeItem('planiverse_profiles');
        localStorage.removeItem('planiverse_onboarding_done');
      } catch { /* ignorar */ }
      setStatus('success');
    } catch {
      setErrorMsg('Ocurrió un error. El enlace puede haber expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
            style={{ backgroundColor: '#EFF6FF' }}>
            🔑
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Planiverse</h1>
        </div>

        {/* Estado: cargando */}
        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verificando enlace...</p>
          </div>
        )}

        {/* Estado: error */}
        {status === 'error' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
            <p className="text-gray-600 mb-4">{errorMsg}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-800 mb-1">📱 ¿Estás en el teléfono?</p>
              <p className="text-sm text-blue-700">Copia el link del correo y ábrelo directamente en <strong>Chrome</strong> o <strong>Safari</strong>, no desde la app del correo.</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Estado: formulario listo */}
        {status === 'ready' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Nueva contraseña</h2>
            <p className="text-sm text-gray-500 mb-6">Para la cuenta: <span className="font-medium text-gray-700">{email}</span></p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </>
        )}

        {/* Estado: éxito */}
        {status === 'success' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-gray-600 mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
