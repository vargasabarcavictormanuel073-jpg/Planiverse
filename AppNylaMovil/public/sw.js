// Service Worker para Planiverse PWA
// Versión: 1.0.0

const CACHE_NAME = 'planiverse-v1';
const RUNTIME_CACHE = 'planiverse-runtime-v1';

// Recursos estáticos para cachear durante la instalación
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/task',
  '/calendar',
  '/notes',
  '/reminders',
  '/profile',
  '/tools',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error durante la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Eliminar caches antiguos
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        return self.clients.claim();
      })
  );
});

// Estrategia de caché: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Ignorar requests de Firebase y APIs externas
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('firestore.googleapis.com') ||
    url.pathname.includes('firebase') ||
    url.pathname.includes('google')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseClone = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Sirviendo desde cache:', request.url);
              return cachedResponse;
            }
            
            // Si no está en cache y es una navegación, mostrar página offline
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Sincronización en segundo plano (para futuras mejoras)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí puedes agregar lógica para sincronizar datos pendientes
      Promise.resolve()
    );
  }
});

// Notificaciones push (ya tienes el código en notifications.service.ts)
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Planiverse', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
