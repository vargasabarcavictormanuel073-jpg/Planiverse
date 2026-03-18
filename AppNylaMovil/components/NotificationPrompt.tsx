/**
 * NotificationPrompt - Modal para solicitar permiso de notificaciones
 * Diseño con tema dinámico que se adapta al rol del usuario
 * 
 * Este componente muestra un modal personalizado que explica los beneficios
 * de activar las notificaciones con colores e iconos según el rol del usuario.
 */

'use client';

import { useState, useEffect } from 'react';
import { NotificationService } from '@/lib/firebase/notifications.service';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';

export default function NotificationPrompt() {
  const { user } = useFirebaseAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string>('student');

  useEffect(() => {
    // Cargar rol del usuario
    const userRole = localStorage.getItem('planiverse_role') || 'student';
    setRole(userRole);

    // Verificar si debemos mostrar el prompt
    const checkNotificationStatus = () => {
      if (!user) return;

      // No mostrar si no está soportado
      if (!NotificationService.isSupported()) {
        return;
      }

      // No mostrar si ya fue rechazado
      if (NotificationService.isDenied()) {
        return;
      }

      // No mostrar si ya tiene permiso
      if (NotificationService.hasPermission()) {
        return;
      }

      // Verificar si el usuario ya cerró el prompt antes
      const promptDismissed = localStorage.getItem('planiverse_notification_prompt_dismissed');
      if (promptDismissed === 'true') {
        return;
      }

      // Mostrar el prompt después de 3 segundos
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    };

    checkNotificationStatus();
  }, [user]);

  const handleAccept = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const success = await NotificationService.initializeNotifications(user.uid);
      
      if (success) {
        console.log('Notificaciones activadas correctamente');
        setShowPrompt(false);
      } else {
        alert('No se pudieron activar las notificaciones. Por favor, verifica los permisos de tu navegador.');
      }
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      alert('Ocurrió un error al activar las notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('planiverse_notification_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  const handleLater = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  // Configuración de tema según el rol
  const themeConfig = {
    student: {
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
      accentColor: 'text-blue-600',
      checkColor: 'text-blue-500',
      emoji: '🎓',
      title: '¡Mantente al día con tus estudios!',
      subtitle: 'Recibe recordatorios de tareas, exámenes y eventos importantes.',
      benefits: [
        'Recordatorios de tareas y exámenes',
        'Alertas de fechas límite',
        'Notificaciones de eventos académicos'
      ]
    },
    teacher: {
      gradient: 'from-orange-500 via-orange-600 to-red-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonBg: 'bg-gradient-to-r from-orange-500 to-red-600',
      buttonHover: 'hover:from-orange-600 hover:to-red-700',
      accentColor: 'text-orange-600',
      checkColor: 'text-orange-500',
      emoji: '👨‍🏫',
      title: '¡Gestiona tus clases eficientemente!',
      subtitle: 'Recibe recordatorios de planeaciones, clases y actividades docentes.',
      benefits: [
        'Recordatorios de planeaciones pendientes',
        'Alertas de clases programadas',
        'Notificaciones de eventos escolares'
      ]
    },
    other: {
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonBg: 'bg-gradient-to-r from-purple-500 to-pink-600',
      buttonHover: 'hover:from-purple-600 hover:to-pink-700',
      accentColor: 'text-purple-600',
      checkColor: 'text-purple-500',
      emoji: '✨',
      title: '¡Organízate mejor!',
      subtitle: 'Recibe recordatorios de tus tareas, eventos y actividades importantes.',
      benefits: [
        'Recordatorios de tareas pendientes',
        'Alertas de eventos próximos',
        'Notificaciones personalizadas'
      ]
    }
  };

  const theme = themeConfig[role as keyof typeof themeConfig] || themeConfig.student;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative max-w-md w-full animate-scale-in">
        {/* Fondo con gradiente del tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-2xl opacity-10 blur-xl`}></div>
        
        {/* Contenido del modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white relative overflow-hidden`}>
            {/* Partículas decorativas */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            
            {/* Icono de campana animado */}
            <div className="flex justify-center mb-4 relative z-10">
              <div className={`w-20 h-20 ${theme.iconBg} rounded-full flex items-center justify-center shadow-lg animate-bounce-slow`}>
                <div className="text-4xl">{theme.emoji}</div>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-center mb-2 relative z-10">
              {theme.title}
            </h3>

            {/* Subtítulo */}
            <p className="text-center text-white/90 text-sm relative z-10">
              {theme.subtitle}
            </p>
          </div>

          {/* Cuerpo del modal */}
          <div className="p-6">
            {/* Beneficios */}
            <div className="space-y-3 mb-6">
              {theme.benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center mt-0.5`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Nota informativa */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-200">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-600">
                  Puedes desactivar las notificaciones en cualquier momento desde la configuración de tu navegador.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              {/* Botón principal con gradiente */}
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className={`w-full px-6 py-4 ${theme.buttonBg} ${theme.buttonHover} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Activando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Activar notificaciones</span>
                  </>
                )}
              </button>
              
              {/* Botón secundario */}
              <button
                onClick={handleLater}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 transition-all duration-200"
              >
                Más tarde
              </button>

              {/* Botón de cerrar permanentemente */}
              <button
                onClick={handleDismiss}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                No volver a preguntar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
