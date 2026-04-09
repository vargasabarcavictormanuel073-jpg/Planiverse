/**
 * ProfilePage - Página de perfil del usuario
 * 
 * Esta página muestra la información del perfil del usuario autenticado.
 * Los datos se cargan desde Firestore con fallback a localStorage.
 * 
 * Información mostrada:
 * - Email del usuario (desde Firebase Auth)
 * - Rol (Estudiante, Maestro u Otro)
 * - Nombre completo
 * - Apodo
 * - Edad
 * 
 * La página verifica que el usuario esté autenticado y muestra
 * un mensaje de error si no se puede cargar el perfil.
 * En el futuro se puede agregar funcionalidad para editar el perfil.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import CacheStats from '@/components/CacheStats';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';
import { FirestoreService } from '@/lib/firebase/firestore.service';
import { AuthService } from '@/lib/firebase/auth.service';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  
  const [profile, setProfile] = useState({
    role: '',
    fullName: '',
    nickname: '',
    age: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/');
        return;
      }

interface ProfileData {
  role?: string;
  fullName?: string;
  nickname?: string;
  age?: number;
}

      try {
        // Cargar perfil desde Firestore con el orden correcto: collectionName, docId, userId
        const profileData = await FirestoreService.read<ProfileData>('profile', 'data', user.uid);
        
        if (profileData) {
          setProfile({
            role: profileData.role || '',
            fullName: profileData.fullName || 'No especificado',
            nickname: profileData.nickname || 'No especificado',
            age: profileData.age?.toString() || 'No especificado'
          });
        } else {
          // Fallback a localStorage si no hay datos en Firestore
          const roleData = localStorage.getItem('planiverse_role');
          const localProfileData = localStorage.getItem('planiverse_profile');
          
          if (localProfileData) {
            try {
              const parsed = JSON.parse(localProfileData);
              setProfile({
                role: roleData || '',
                fullName: parsed.fullName || 'No especificado',
                nickname: parsed.nickname || 'No especificado',
                age: parsed.age?.toString() || 'No especificado'
              });
            } catch {
              setProfile({
                role: roleData || '',
                fullName: 'No especificado',
                nickname: 'No especificado',
                age: 'No especificado'
              });
            }
          } else {
            setError('No se encontró información del perfil');
          }
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AppLayout title="Perfil">
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Estudiante';
      case 'teacher': return 'Maestro';
      case 'other': return 'Otro';
      default: return 'No especificado';
    }
  };

  const getRoleAvatar = (role: string) => {
    switch (role) {
      case 'student': return '🎓';
      case 'teacher': return '📚';
      case 'other': return '✨';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return '#3B82F6'; // Blue
      case 'teacher': return '#F97316'; // Orange
      case 'other': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  };

  return (
    <AppLayout title="Perfil">
      <div className="max-w-3xl mx-auto">
        {/* Header con avatar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar grande con emoji según rol */}
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-lg"
              style={{ backgroundColor: `${getRoleColor(profile.role)}20` }}
            >
              {getRoleAvatar(profile.role)}
            </div>
            
            {/* Información principal */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName}</h2>
              <p className="text-xl text-gray-600 mb-3">@{profile.nickname}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span 
                  className="px-4 py-2 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: getRoleColor(profile.role) }}
                >
                  {getRoleAvatar(profile.role)} {getRoleLabel(profile.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">📧 Email</label>
                <p className="text-lg text-gray-900 font-medium break-all">{user.email}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">🎂 Edad</label>
              <p className="text-lg text-gray-900 font-medium">{profile.age} años</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">👤 Nombre Completo</label>
              <p className="text-lg text-gray-900 font-medium">{profile.fullName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">✏️ Apodo</label>
              <p className="text-lg text-gray-900 font-medium">{profile.nickname}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas del caché */}
        <CacheStats />

        {/* Sección de peligro - Eliminar cuenta */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border-2 border-red-200 dark:border-red-800 p-8 mt-6">
          <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
            <span>⚠️</span> Zona de Peligro
          </h3>
          <p className="text-red-800 dark:text-red-200 mb-4">
            Esta acción es irreversible. Se eliminarán todos tus datos permanentemente.
          </p>
          
          <button
            onClick={() => {
              if (confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción es IRREVERSIBLE y se eliminarán todos tus datos:\n- Tareas\n- Notas\n- Eventos\n- Recordatorios\n- Perfil\n\n¿Deseas continuar?')) {
                if (confirm('Última confirmación: ¿Eliminar cuenta permanentemente?')) {
                  handleDeleteAccount();
                }
              }
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            🗑️ Eliminar Mi Cuenta Permanentemente
          </button>
        </div>
      </div>
    </AppLayout>
  );

  async function handleDeleteAccount() {
    try {
      setIsLoading(true);
      const result = await AuthService.deleteAccount();
      
      if (result.success) {
        // Redirigir a página de inicio después de eliminar
        router.push('/');
      } else {
        setError(result.error || 'Error al eliminar la cuenta');
      }
    } catch (err) {
      setError('Error al eliminar la cuenta');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }
