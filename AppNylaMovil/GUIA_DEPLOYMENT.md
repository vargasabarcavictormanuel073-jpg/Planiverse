# 🚀 Guía Completa de Deployment

## 📋 Checklist Pre-Deployment

### ✅ Lo que YA tienes listo:
- [x] PWA configurada con manifest.json
- [x] Service Worker (sw.js)
- [x] Iconos 192x192 y 512x512
- [x] Next.js configurado
- [x] Firebase configurado
- [x] Vercel.json creado

### ⚠️ Lo que FALTA:

#### 1. Screenshots para PWA
- [ ] Screenshot móvil (540x720px)
- [ ] Screenshot desktop (1280x720px)

#### 2. Iconos adicionales para Play Store
- [ ] Icono adaptativo (512x512px con zona segura)
- [ ] Feature graphic (1024x500px)
- [ ] Icono de alta resolución (512x512px)

#### 3. Archivos para TWA (Trusted Web Activity)
- [ ] assetlinks.json
- [ ] Configuración de Digital Asset Links

#### 4. Variables de entorno en Vercel
- [ ] Configurar Firebase keys

---

## 🌐 PARTE 1: Desplegar en Vercel

### Paso 1: Preparar el proyecto

```bash
# Verificar que todo compile
npm run build

# Verificar PWA
npm run verify-pwa
```

### Paso 2: Subir a GitHub (si no lo has hecho)

```bash
git init
git add .
git commit -m "Initial commit - Planiverse PWA"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/planiverse.git
git push -u origin main
```

### Paso 3: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js

### Paso 4: Configurar Variables de Entorno

En Vercel Dashboard > Settings > Environment Variables, agrega:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Paso 5: Deploy

```bash
# Opción 1: Desde Vercel Dashboard
Click en "Deploy"

# Opción 2: Desde CLI
npm i -g vercel
vercel login
vercel --prod
```

### Paso 6: Verificar PWA en producción

1. Abre tu URL de Vercel (ej: planiverse.vercel.app)
2. Abre Chrome DevTools > Lighthouse
3. Ejecuta auditoría PWA
4. Debe obtener 100% en PWA

---

## 📱 PARTE 2: Publicar en Google Play Store

### Requisitos previos:

1. **Cuenta de Google Play Console** ($25 USD pago único)
2. **Dominio verificado** (tu URL de Vercel)
3. **Bubblewrap CLI** (para generar APK/AAB)

### Paso 1: Instalar Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Paso 2: Inicializar proyecto TWA

```bash
bubblewrap init --manifest https://tu-app.vercel.app/manifest.json
```

Responde las preguntas:
- Domain: tu-app.vercel.app
- Package name: com.tuempresa.planiverse
- App name: Planiverse
- Display mode: standalone
- Orientation: portrait
- Theme color: #3B82F6
- Background color: #ffffff

### Paso 3: Generar keystore (firma digital)

```bash
# Bubblewrap lo genera automáticamente, pero puedes crear uno personalizado:
keytool -genkey -v -keystore planiverse-release-key.keystore -alias planiverse -keyalg RSA -keysize 2048 -validity 10000
```

Guarda la contraseña en un lugar seguro.

### Paso 4: Construir APK/AAB

```bash
# Para testing (APK)
bubblewrap build

# Para producción (AAB - Android App Bundle)
bubblewrap build --skipPwaValidation
```

### Paso 5: Configurar Digital Asset Links

Crea el archivo `public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.tuempresa.planiverse",
    "sha256_cert_fingerprints": ["TU_SHA256_FINGERPRINT"]
  }
}]
```

Para obtener el SHA256:
```bash
keytool -list -v -keystore planiverse-release-key.keystore -alias planiverse
```

### Paso 6: Actualizar Next.js para servir assetlinks

Agrega a `next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: '/.well-known/assetlinks.json',
      destination: '/api/assetlinks',
    },
  ];
},
```

### Paso 7: Crear cuenta en Google Play Console

1. Ve a [play.google.com/console](https://play.google.com/console)
2. Paga los $25 USD
3. Completa tu perfil de desarrollador

### Paso 8: Crear nueva aplicación

1. Click en "Crear aplicación"
2. Nombre: Planiverse
3. Idioma predeterminado: Español
4. Tipo: Aplicación
5. Gratis o de pago: Gratis

### Paso 9: Completar ficha de Play Store

Necesitarás:

**Textos:**
- Descripción corta (80 caracteres)
- Descripción completa (4000 caracteres)
- Título (30 caracteres)

**Gráficos:**
- Icono de aplicación: 512x512px
- Feature graphic: 1024x500px
- Screenshots: mínimo 2, máximo 8
  - Teléfono: 320-3840px de ancho
  - Tablet 7": 1024-7680px de ancho

**Información:**
- Categoría: Productividad
- Correo de contacto
- Política de privacidad (URL)

### Paso 10: Subir AAB

1. Ve a "Producción" > "Crear nueva versión"
2. Sube el archivo `.aab` generado
3. Completa notas de la versión
4. Revisa y publica

### Paso 11: Revisión de Google

- Tiempo estimado: 1-7 días
- Google revisará tu app
- Recibirás email cuando esté aprobada

---

## 🎨 Recursos que necesitas crear

### 1. Screenshots

Usa tu navegador en modo responsive:

```bash
# Inicia tu app
npm run dev

# Abre Chrome DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Configura resolución y toma screenshots
```

Resoluciones recomendadas:
- Móvil: 1080x1920px (9:16)
- Tablet: 1600x2560px
- Desktop: 1920x1080px

### 2. Feature Graphic (1024x500px)

Herramientas gratuitas:
- [Canva](https://canva.com) - Plantillas prediseñadas
- [Figma](https://figma.com) - Diseño profesional
- [Photopea](https://photopea.com) - Photoshop online gratis

### 3. Política de Privacidad

Generadores gratuitos:
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Termly](https://termly.io/products/privacy-policy-generator/)

Súbela a tu sitio: `/privacy-policy`

---

## 🔧 Comandos útiles

```bash
# Verificar build local
npm run build && npm start

# Verificar PWA
npm run verify-pwa

# Analizar bundle size
npm run analyze

# Test en red local (para móvil)
npm run dev:mobile
# Luego accede desde tu móvil: http://TU_IP:3000

# Generar APK de prueba
bubblewrap build

# Instalar APK en dispositivo conectado
adb install app-release-signed.apk
```

---

## 📝 Checklist Final

### Antes de Vercel:
- [ ] `npm run build` sin errores
- [ ] Variables de entorno en `.env.local`
- [ ] `.gitignore` incluye `.env.local`
- [ ] Firebase configurado correctamente

### Antes de Play Store:
- [ ] PWA funcionando en producción (Vercel)
- [ ] Lighthouse PWA score > 90
- [ ] Screenshots creados
- [ ] Feature graphic creado
- [ ] Política de privacidad publicada
- [ ] assetlinks.json configurado
- [ ] AAB generado y firmado
- [ ] Cuenta de Play Console activa

---

## 🆘 Solución de problemas comunes

### Error: "PWA not installable"
- Verifica que manifest.json sea accesible
- Verifica que sw.js esté registrado
- Usa HTTPS (Vercel lo hace automáticamente)

### Error: "Digital Asset Links not verified"
- Verifica que assetlinks.json sea accesible
- Verifica el SHA256 fingerprint
- Espera 24-48h para propagación

### Error: "Build failed on Vercel"
- Verifica que todas las dependencias estén en package.json
- Verifica que no haya errores de TypeScript
- Revisa los logs en Vercel Dashboard

---

## 📚 Recursos adicionales

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## 💡 Tips finales

1. **Prueba en múltiples dispositivos** antes de publicar
2. **Optimiza imágenes** para reducir tamaño de descarga
3. **Configura analytics** (Google Analytics, Firebase Analytics)
4. **Prepara respuestas** para reviews de usuarios
5. **Planifica actualizaciones** regulares

¡Buena suerte con tu deployment! 🚀
