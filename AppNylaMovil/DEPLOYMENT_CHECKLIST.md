# ✅ Checklist Completo de Deployment

## 🎯 Objetivo
Desplegar Planiverse en Vercel y publicar en Google Play Store

---

## 📦 FASE 1: Preparación Local

### 1.1 Verificar proyecto
```bash
npm install
npm run build
npm run verify-pwa
npm run pre-deploy
```

**Resultado esperado:** ✅ Sin errores

### 1.2 Configurar variables de entorno
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Completar con credenciales de Firebase
- [ ] Verificar que `.env.local` esté en `.gitignore`

### 1.3 Crear screenshots
- [ ] Screenshot móvil (1080x1920px) → `public/screenshot-mobile.png`
- [ ] Screenshot desktop (1920x1080px) → `public/screenshot-desktop.png`
- [ ] 2-4 screenshots adicionales para Play Store
- [ ] Feature graphic (1024x500px) → `public/feature-graphic.png`

**Guía:** Ver `CREAR_SCREENSHOTS.md`

### 1.4 Preparar Git
```bash
git init
git add .
git commit -m "Ready for deployment"
```

---

## 🌐 FASE 2: Deployment en Vercel

### 2.1 Crear repositorio en GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/planiverse.git
git branch -M main
git push -u origin main
```

### 2.2 Conectar con Vercel
1. [ ] Ir a [vercel.com](https://vercel.com)
2. [ ] Click "Add New Project"
3. [ ] Importar repositorio de GitHub
4. [ ] Vercel detecta Next.js automáticamente
5. [ ] Click "Deploy"

### 2.3 Configurar variables de entorno
1. [ ] Ir a Settings > Environment Variables
2. [ ] Agregar todas las variables de Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
3. [ ] Seleccionar: Production, Preview, Development
4. [ ] Re-deployar

**Guía:** Ver `FIREBASE_VERCEL_CONFIG.md`

### 2.4 Configurar Firebase
1. [ ] Firebase Console > Authentication > Settings
2. [ ] Agregar dominio autorizado: `tu-app.vercel.app`
3. [ ] Verificar reglas de Firestore

### 2.5 Verificar deployment
1. [ ] Abrir `https://tu-app.vercel.app`
2. [ ] Chrome DevTools > Lighthouse
3. [ ] Ejecutar auditoría PWA
4. [ ] Score debe ser > 90
5. [ ] Probar instalación de PWA
6. [ ] Probar login/registro
7. [ ] Verificar que todas las páginas funcionen

**Resultado esperado:** ✅ App funcionando en producción

---

## 📱 FASE 3: Preparación para Play Store

### 3.1 Instalar herramientas
```bash
npm install -g @bubblewrap/cli
```

### 3.2 Inicializar TWA
```bash
bubblewrap init --manifest https://tu-app.vercel.app/manifest.json
```

**Configuración:**
- Package name: `com.planiverse.app`
- App name: `Planiverse`
- Display mode: `standalone`
- Orientation: `portrait`
- Theme color: `#3B82F6`
- Background color: `#ffffff`

### 3.3 Construir AAB
```bash
bubblewrap build
```

**Resultado:** Archivo `.aab` en carpeta del proyecto

### 3.4 Obtener SHA256 fingerprint
```bash
keytool -list -v -keystore android.keystore -alias android
```

- [ ] Copiar el SHA256 fingerprint
- [ ] Actualizar `public/.well-known/assetlinks.json`
- [ ] Commit y push a GitHub

### 3.5 Verificar assetlinks
1. [ ] Esperar deployment en Vercel
2. [ ] Verificar: `https://tu-app.vercel.app/.well-known/assetlinks.json`
3. [ ] Debe mostrar el JSON con tu SHA256

---

## 🏪 FASE 4: Publicación en Play Store

### 4.1 Crear cuenta
- [ ] Ir a [play.google.com/console](https://play.google.com/console)
- [ ] Pagar $25 USD (pago único)
- [ ] Completar perfil de desarrollador

### 4.2 Crear aplicación
1. [ ] Click "Crear aplicación"
2. [ ] Nombre: `Planiverse`
3. [ ] Idioma: Español
4. [ ] Tipo: Aplicación
5. [ ] Gratis/Pago: Gratis

### 4.3 Completar ficha de la tienda

**Detalles de la aplicación:**
- [ ] Título: `Planiverse - Organizador Personal` (30 caracteres)
- [ ] Descripción corta (80 caracteres):
  ```
  Tu organizador personal para tareas, calendario, notas y recordatorios
  ```
- [ ] Descripción completa (hasta 4000 caracteres):
  ```
  Planiverse es tu organizador personal todo-en-uno que te ayuda a:
  
  ✅ Gestionar tareas y proyectos
  📅 Organizar tu calendario
  📝 Tomar notas rápidas
  ⏰ Configurar recordatorios
  🎯 Crear rutinas personalizadas
  🛠️ Acceder a herramientas educativas
  
  Características principales:
  • Interfaz intuitiva y fácil de usar
  • Sincronización en la nube
  • Funciona sin conexión
  • Temas claro y oscuro
  • Notificaciones inteligentes
  • Exportar a PDF
  • Compartir con otros
  
  Perfecto para estudiantes, profesores y profesionales que buscan
  organizar su vida de manera eficiente.
  
  ¡Descarga Planiverse y empieza a organizarte hoy!
  ```

**Recursos gráficos:**
- [ ] Icono de aplicación: 512x512px
- [ ] Feature graphic: 1024x500px
- [ ] Screenshots de teléfono: mínimo 2 (1080x1920px)
- [ ] Screenshots de tablet: opcional (1200x1920px)

**Categorización:**
- [ ] Categoría: Productividad
- [ ] Etiquetas: organizador, tareas, calendario, notas

**Información de contacto:**
- [ ] Correo electrónico
- [ ] Sitio web: `https://tu-app.vercel.app`
- [ ] Política de privacidad: `https://tu-app.vercel.app/privacy-policy`

### 4.4 Configurar contenido

**Clasificación de contenido:**
- [ ] Completar cuestionario
- [ ] Seleccionar: Apto para todos

**Público objetivo:**
- [ ] Edad objetivo: 13+
- [ ] Contenido: Educativo/Productividad

**Privacidad y seguridad:**
- [ ] Política de privacidad (URL)
- [ ] Declaración de seguridad de datos
- [ ] Permisos utilizados

### 4.5 Subir AAB

1. [ ] Ir a "Producción" > "Crear nueva versión"
2. [ ] Subir archivo `.aab`
3. [ ] Nombre de versión: `1.0.0`
4. [ ] Notas de la versión:
   ```
   Primera versión de Planiverse
   • Gestión de tareas
   • Calendario integrado
   • Notas y recordatorios
   • Herramientas educativas
   • Sincronización en la nube
   ```
5. [ ] Guardar y revisar

### 4.6 Enviar a revisión
- [ ] Revisar toda la información
- [ ] Click "Enviar a revisión"
- [ ] Esperar aprobación (1-7 días)

---

## 🎉 FASE 5: Post-Publicación

### 5.1 Monitoreo
- [ ] Configurar Google Analytics
- [ ] Configurar Firebase Analytics
- [ ] Monitorear errores en Vercel
- [ ] Revisar comentarios en Play Store

### 5.2 Marketing
- [ ] Compartir en redes sociales
- [ ] Crear página de aterrizaje
- [ ] Preparar material promocional
- [ ] Solicitar reviews

### 5.3 Mantenimiento
- [ ] Planificar actualizaciones
- [ ] Responder a usuarios
- [ ] Corregir bugs reportados
- [ ] Agregar nuevas funcionalidades

---

## 📊 Resumen de Tiempos

| Fase | Tiempo estimado |
|------|----------------|
| Preparación local | 1-2 horas |
| Deployment Vercel | 15-30 minutos |
| Preparación Play Store | 2-3 horas |
| Publicación Play Store | 30 minutos |
| Revisión de Google | 1-7 días |
| **TOTAL** | **4-6 horas + espera** |

---

## 📚 Documentación de Referencia

- `GUIA_DEPLOYMENT.md` - Guía completa detallada
- `PASOS_RAPIDOS.md` - Pasos rápidos resumidos
- `CREAR_SCREENSHOTS.md` - Cómo crear screenshots
- `FIREBASE_VERCEL_CONFIG.md` - Configurar Firebase en Vercel
- `.env.example` - Template de variables de entorno

---

## 🆘 Soporte

### Problemas comunes:
1. **Build failed en Vercel** → Ver logs, verificar variables de entorno
2. **PWA no instala** → Verificar manifest.json y sw.js
3. **Firebase no conecta** → Verificar authorized domains
4. **Digital Asset Links falla** → Esperar 24-48h, verificar SHA256

### Recursos:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Bubblewrap Docs](https://github.com/GoogleChromeLabs/bubblewrap)

---

## ✅ Estado Actual

Marca lo que ya tienes completado:

- [x] Proyecto Next.js funcionando
- [x] PWA configurada
- [x] Firebase integrado
- [x] Iconos creados
- [ ] Screenshots creados
- [ ] Deployed en Vercel
- [ ] Variables de entorno configuradas
- [ ] TWA generada
- [ ] Publicado en Play Store

---

¡Éxito con tu deployment! 🚀
