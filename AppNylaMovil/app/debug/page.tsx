'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});
  const [adBlockerDetected, setAdBlockerDetected] = useState<boolean | null>(null);
  const [firebaseTest, setFirebaseTest] = useState<string>('Probando...');

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = auth.currentUser;
      const session = localStorage.getItem('planiverse_session');
      const profile = localStorage.getItem('planiverse_profiles');
      
      setInfo({
        userAuth: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        } : null,
        session: session ? JSON.parse(session) : null,
        profile: profile ? JSON.parse(profile) : null,
        timestamp: new Date().toISOString()
      });
    };

    // Detectar ad blocker
    const detectAdBlocker = async () => {
      try {
        const testUrl = 'https://firestore.googleapis.com/';
        const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
        setAdBlockerDetected(false);
      } catch (error) {
        setAdBlockerDetected(true);
      }
    };

    // Probar escritura en Firestore
    const testFirestore = async () => {
      if (!auth.currentUser) {
        setFirebaseTest('❌ No hay usuario autenticado');
        return;
      }

      try {
        const testRef = doc(db, 'users', auth.currentUser.uid, 'test', 'connection');
        await setDoc(testRef, {
          test: true,
          timestamp: new Date().toISOString()
        });
        setFirebaseTest('✅ Firestore funciona correctamente');
      } catch (error: any) {
        setFirebaseTest(`❌ Error: ${error.message || error.code || 'Desconocido'}`);
      }
    };

    checkAuth();
    detectAdBlocker();
    testFirestore();
    
    const interval = setInterval(() => {
      checkAuth();
      testFirestore();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Info</h1>
        
        {/* ALERTA DE AD BLOCKER */}
        {adBlockerDetected === true && (
          <div className="mb-6 p-6 bg-red-100 border-4 border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              ⚠️ AD BLOCKER DETECTADO
            </h2>
            <p className="text-red-700 text-lg mb-3">
              Tu ad blocker está bloqueando Firebase. DEBES desactivarlo para localhost.
            </p>
            <div className="bg-white p-4 rounded mt-3">
              <p className="font-bold mb-2">Cómo desactivar:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Haz clic en el icono de tu ad blocker (uBlock Origin, AdBlock, etc.)</li>
                <li>Busca la opción "Desactivar en este sitio" o "Pausar"</li>
                <li>Recarga la página</li>
              </ol>
            </div>
          </div>
        )}

        {adBlockerDetected === false && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
            <p className="text-green-800 font-bold">✅ No se detectó ad blocker</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Test de Firestore */}
          <div className={`p-4 rounded ${firebaseTest.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className="font-bold text-lg mb-2">Test de Firestore:</h2>
            <p className="text-lg font-mono">{firebaseTest}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Firebase Auth User:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(info.userAuth, null, 2)}
            </pre>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">LocalStorage Session:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(info.session, null, 2)}
            </pre>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">LocalStorage Profile:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(info.profile, null, 2)}
            </pre>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Timestamp:</h2>
            <p className="text-sm">{info.timestamp}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={() => {
              // Limpiar TODO el localStorage
              localStorage.clear();
              // Limpiar sessionStorage también
              sessionStorage.clear();
              alert('✅ Sesión limpiada completamente. Recargando página...');
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            🗑️ Limpiar Sesión Completa
          </button>
          
          <a
            href="/autenticacion"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block font-medium text-center"
          >
            Ir a Autenticación
          </a>
        </div>
      </div>
    </div>
  );
}
