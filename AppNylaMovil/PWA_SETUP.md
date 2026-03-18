# 📱 Guía de Configuración PWA - Planiverse

## ✅ Cambios Completados

### **Archivos Nuevos Creados (4)**
1. ✅ `public/manifest.json` - Configuración PWA
2. ✅ `public/sw.js` - Service Worker para funcionalidad offline
3. ⚠️ `public/icon-192x192.png` - **PENDIENTE: Crear icono**
4. ⚠️ `public/icon-512x512.png` - **PENDIENTE: Crear icono**

### **Archivos Modificados (7)**
5. ✅ `app/layout.tsx` - Meta tags PWA y registro de Service Worker
6. ✅ `app/globals.css` - Estilos optimizados para móvil y touch
7. ✅ `lib/firebase/config.ts` - Persistencia offline habilitada
8. ✅ `next.config.ts` - Configuración PWA y headers
9. ✅ `components/layout/AppLayout.tsx` - Layout responsive mejorado

---

## 🎨 PASO 1: Crear Iconos PWA (REQUERIDO)

Necesitas crear 2 iconos para que la PWA funcione correctamente:

### **Opción A: Usar Generador Online (Recomendado)**

1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube tu logo/icono (mínimo 512x512px)
3. Descarga el paquete de iconos
4. Copia estos archivos a la carpeta `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

### **Opción B: Crear Manualmente**

Si tienes un logo, créalo en estos tamaños:
- **192x192 píxeles** → Guarda como `public/icon-192x192.png`
- **512x512 píxeles** → Guarda como `public/icon-512x512.png`

**Recomendaciones:**
- Fondo sólido (no transparente para mejor compatibilidad)
- Diseño simple y reconocible
- Colores que coincidan con tu tema (azul #3B82F6 para estudiantes)

### **Opción C: Placeholder Temporal**

Para probar rápidamente, puedes usar un emoji como icono:

```bash
# En Windows PowerShell:
# Descarga un icono placeholder desde un generador online
# O usa cualquier imagen cuadrada que tengas
```

---

## 🧪 PASO 2: Probar la PWA

### **En Desarrollo (localhost)**

```bash
# 1. Iniciar el servidor
npm run dev

# 2. Abrir Chrome DevTools (F12)
# 3. Ir a la pestaña "Application"
# 4. En el menú izquierdo, buscar:
#    - Manifest: Verificar que se carga correctamente
#    - Service Workers: Verificar que está registrado
#    - Storage: Verificar IndexedDB (Firebase offline)

# 5. Probar en modo móvil:
#    - F12 > Toggle Device Toolbar (Ctrl+Shift+M)
#    - Seleccionar iPhone o Android
#    - Probar navegación y funcionalidad
```

### **En tu Teléfono (Red Local)**

```bash
# 1. Obtener tu IP local
ipconfig  # Windows
# Busca "IPv4 Address" (ejemplo: 192.168.1.100)

# 2. En tu teléfono, abrir navegador y visitar:
http://TU-IP:3000
# Ejemplo: http://192.168.1.100:3000

# 3. Instalar la PWA:
#    - Chrome Android: Menú > "Agregar a pantalla de inicio"
#    - Safari iOS: Compartir > "Agregar a pantalla de inicio"
```

### **En Producción (Vercel/Netlify)**

```bash
# 1. Hacer build de producción
npm run build

# 2. Probar localmente
npm start

# 3. Desplegar a Vercel
npx vercel

# 4. Visitar la URL en tu móvil
# 5. Instalar la PWA desde el navegador
```

---

## 📋 PASO 3: Verificar Funcionalidades

### **Checklist de Pruebas**

- [ ] **Instalación PWA**
  - [ ] Aparece el banner "Agregar a pantalla de inicio"
  - [ ] Se instala correctamente
  - [ ] El icono aparece en la pantalla de inicio
  - [ ] Abre en modo standalone (sin barra del navegador)

- [ ] **Funcionalidad Offline**
  - [ ] Activar modo avión
  - [ ] La app sigue funcionando
  - [ ] Los datos de Firebase se cargan desde cache
  - [ ] Puedes navegar entre páginas

- [ ] **Responsive Design**
  - [ ] Se ve bien en móvil (320px - 480px)
  - [ ] Se ve bien en tablet (768px - 1024px)
  - [ ] Se ve bien en desktop (1280px+)
  - [ ] Los botones son fáciles de tocar (mínimo 44px)

- [ ] **Touch Optimization**
  - [ ] Los botones responden al toque
  - [ ] No hay zoom accidental en inputs
  - [ ] El scroll es suave
  - [ ] Los gestos funcionan correctamente

- [ ] **Performance**
  - [ ] La app carga rápido (<3 segundos)
  - [ ] Las transiciones son fluidas
  - [ ] No hay lag al navegar

---

## 🔧 PASO 4: Optimizaciones Adicionales (Opcional)

### **A. Agregar Screenshots para Tiendas**

Crea capturas de pantalla y agrégalas a `public/`:
- `screenshot-mobile.png` (540x720px)
- `screenshot-desktop.png` (1280x720px)

### **B. Mejorar el Service Worker**

El Service Worker actual es básico. Puedes mejorarlo:

```javascript
// public/sw.js
// Agregar estrategias de cache más avanzadas
// Agregar sincronización en segundo plano
// Agregar notificaciones push
```

### **C. Agregar Splash Screen (iOS)**

Crea imágenes de splash screen para iOS:

```html
<!-- En app/layout.tsx, dentro de <head> -->
<link rel="apple-touch-startup-image" href="/splash-640x1136.png" />
<link rel="apple-touch-startup-image" href="/splash-750x1334.png" />
<!-- Más tamaños según necesites -->
```

### **D. Habilitar Notificaciones Push**

Ya tienes el código base en `lib/firebase/notifications.service.ts`.

Para activarlo:
1. Obtener VAPID key de Firebase Console
2. Actualizar el código con tu key
3. Solicitar permisos al usuario
4. Enviar notificaciones desde Firebase

---

## 📊 PASO 5: Métricas y Análisis

### **Lighthouse Audit**

```bash
# En Chrome DevTools:
# 1. F12 > Lighthouse
# 2. Seleccionar "Progressive Web App"
# 3. Click en "Generate report"
# 4. Objetivo: Score > 90
```

### **Métricas Importantes**

- **Performance**: >90
- **Accessibility**: >90
- **Best Practices**: >90
- **SEO**: >90
- **PWA**: 100 (todos los checks en verde)

---

## 🚀 PASO 6: Publicar en Tiendas (Opcional)

### **Opción A: PWA Pura (Sin Tiendas)**

Tu app ya funciona como PWA. Los usuarios pueden:
1. Visitar tu sitio web
2. Instalarla desde el navegador
3. Usarla como app nativa

**Ventajas:**
- ✅ Sin comisiones de tiendas
- ✅ Actualizaciones instantáneas
- ✅ Sin proceso de revisión

### **Opción B: Publicar en Google Play Store**

Usa **Bubblewrap** o **PWA Builder**:

```bash
# 1. Instalar Bubblewrap
npm install -g @bubblewrap/cli

# 2. Inicializar proyecto
bubblewrap init --manifest https://tu-sitio.com/manifest.json

# 3. Generar APK
bubblewrap build

# 4. Subir a Google Play Console
```

### **Opción C: Publicar en App Store (iOS)**

Usa **PWA Builder** o **Capacitor**:

```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inicializar
npx cap init

# 3. Agregar plataforma iOS
npx cap add ios

# 4. Abrir en Xcode
npx cap open ios

# 5. Compilar y subir a App Store Connect
```

---

## 🐛 Solución de Problemas

### **Problema: Service Worker no se registra**

```javascript
// Verificar en Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Solución: Limpiar cache y recargar
// Chrome DevTools > Application > Clear storage > Clear site data
```

### **Problema: Manifest no se carga**

```bash
# Verificar que el archivo existe:
# http://localhost:3000/manifest.json

# Verificar Content-Type en Network tab:
# Debe ser: application/manifest+json
```

### **Problema: No aparece el banner de instalación**

Requisitos para que aparezca:
1. ✅ HTTPS (o localhost)
2. ✅ manifest.json válido
3. ✅ Service Worker registrado
4. ✅ Iconos de 192px y 512px
5. ✅ start_url válida
6. ✅ display: standalone

### **Problema: Firebase offline no funciona**

```javascript
// Verificar en Console:
// Debe aparecer: "✅ Persistencia offline habilitada"

// Si no aparece, verificar:
// 1. IndexedDB está habilitado en el navegador
// 2. No hay múltiples tabs abiertas (usar incógnito para probar)
```

---

## 📚 Recursos Adicionales

### **Documentación**
- [PWA Builder](https://www.pwabuilder.com/)
- [Google PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firebase Offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

### **Herramientas**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Workbox](https://developers.google.com/web/tools/workbox) (Service Worker avanzado)

### **Testing**
- [BrowserStack](https://www.browserstack.com/) (Probar en dispositivos reales)
- [LambdaTest](https://www.lambdatest.com/) (Testing cross-browser)

---

## ✅ Checklist Final

Antes de considerar la PWA completa:

- [ ] Iconos creados (192px y 512px)
- [ ] PWA se instala correctamente
- [ ] Funciona offline
- [ ] Responsive en todos los tamaños
- [ ] Lighthouse score > 90 en PWA
- [ ] Probado en iOS y Android
- [ ] Service Worker funciona
- [ ] Firebase offline habilitado
- [ ] Notificaciones configuradas (opcional)
- [ ] Publicado en producción

---

## 🎉 ¡Felicidades!

Tu aplicación ahora es una PWA completa que funciona en:
- 💻 Navegadores de escritorio
- 📱 Navegadores móviles
- 📲 Como app instalada (PWA)
- ✈️ Sin conexión (offline)

**Próximos pasos:**
1. Crear los iconos
2. Probar en tu teléfono
3. Desplegar a producción
4. ¡Compartir con usuarios!
