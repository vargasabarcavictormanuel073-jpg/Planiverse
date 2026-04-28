/**
 * Página Principal (Home)
 * Ruta: /
 * 
 * Redirige automáticamente según el estado de autenticación:
 * - Si hay sesión válida → /inicio
 * - Si no hay sesión → /autenticacion
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LocalStorageManager } from '@/lib/auth/services/LocalStorageManager';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si existe una sesión activa
    const session = LocalStorageManager.getSession();
    
    if (session) {
      // Validar que la sesión no esté expirada
      const isValid = new Date(session.expiresAt) > new Date();
      
      if (isValid) {
        // Verificar si el perfil está completo
        const profile = LocalStorageManager.getProfile(session.userId);
        const onboardingDone = localStorage.getItem('planiverse_onboarding_done') === 'true';
        
        if (profile && profile.role && profile.fullName && onboardingDone) {
          // Perfil completo - redirigir al inicio
          router.push('/inicio');
        } else {
          // Perfil incompleto - redirigir a configuración
          router.push('/autenticacion/configuracion');
        }
      } else {
        // Sesión expirada - redirigir a autenticación
        LocalStorageManager.clearSession();
        router.push('/autenticacion');
      }
    } else {
      // No hay sesión - redirigir a autenticación
      router.push('/autenticacion');
    }
  }, [router]);

  // Mostrar loading mientras se verifica
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
