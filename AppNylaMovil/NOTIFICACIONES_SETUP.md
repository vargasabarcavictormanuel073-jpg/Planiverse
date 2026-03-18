# Configuración de Notificaciones Push

Este documento explica cómo configurar las notificaciones push en tu aplicación.

## Paso 1: Habilitar Firebase Cloud Messaging

1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto "planivers-2cf2c"
3. En el menú lateral, ve a "Cloud Messaging"
4. Si no está habilitado, haz clic en "Comenzar"

## Paso 2: Generar VAPID Key

1. En Firebase Console → Cloud Messaging
2. Ve a la pestaña "Web configuration"
3. En "Web Push certificates", haz clic en "Generate key pair"
4. Copia la clave VAPID generada

## Paso 3: Actualizar archivos con tus credenciales

### Archivo: `public/firebase-messaging-sw.js`

Reemplaza las siguientes líneas con tus credenciales de Firebase:

```javascript
firebase.initializeApp({
  apiKey: "TU_API_KEY",  // Copia de .env.local
  authDomain: "planivers-2cf2c.firebaseapp.com",
  projectId: "planivers-2cf2c",
  storageBucket: "planivers-2cf2c.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",  // Copia de Firebase Console
  appId: "TU_APP_ID"  // Copia de Firebase Console
});
```

### Archivo: `lib/firebase/notifications.service.ts`

En la línea 72, reemplaza:

```typescript
vapidKey: 'TU_VAPID_KEY',  // Pega aquí la VAPID key que generaste
```

## Paso 4: Agregar iconos para notificaciones

Crea estos archivos en la carpeta `public/`:

1. `icon-192x192.png` - Icono de 192x192 píxeles
2. `badge-72x72.png` - Badge de 72x72 píxeles

Puedes usar cualquier imagen de tu logo o crear iconos simples.

## Paso 5: Probar las notificaciones

1. Corre tu aplicación: `npm run dev`
2. Abre http://localhost:3000
3. Inicia sesión
4. Después de 3 segundos, verás el modal pidiendo permiso
5. Haz clic en "Activar notificaciones"
6. El navegador te pedirá permiso - acepta
7. Verás en la consola: "Token FCM obtenido: ..."

## Paso 6: Enviar notificaciones de prueba

### Opción A: Desde Firebase Console

1. Ve a Firebase Console → Cloud Messaging
2. Haz clic en "Send your first message"
3. Escribe un título y mensaje
4. Haz clic en "Send test message"
5. Pega el token FCM que viste en la consola
6. Haz clic en "Test"

### Opción B: Programáticamente (para recordatorios automáticos)

Necesitarás crear Cloud Functions para enviar notificaciones automáticas cuando:
- Una tarea está por vencer
- Un evento está próximo
- Un recordatorio se activa

## Funcionalidades implementadas

✅ Modal amigable para solicitar permiso
✅ Explicación de beneficios de las notificaciones
✅ Opción "Más tarde" (vuelve a preguntar en la próxima sesión)
✅ Opción "No volver a preguntar" (guarda preferencia)
✅ Token FCM guardado en Firestore
✅ Notificaciones en primer plano
✅ Notificaciones en segundo plano (cuando la app está cerrada)
✅ Service Worker configurado

## Próximos pasos (opcional)

Para implementar notificaciones automáticas de recordatorios:

1. Crear Cloud Functions en Firebase
2. Programar funciones que revisen tareas/eventos próximos
3. Enviar notificaciones usando los tokens FCM guardados

¿Necesitas ayuda con alguno de estos pasos?
