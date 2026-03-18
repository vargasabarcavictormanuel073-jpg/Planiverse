# ⚡ Pasos Rápidos para Deployment

## 🌐 VERCEL (15 minutos)

### 1. Preparar proyecto
```bash
npm run build
```

### 2. Subir a GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/planiverse.git
git push -u origin main
```

### 3. Deploy en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Importa tu repo de GitHub
4. Agrega variables de entorno (Firebase keys)
5. Click "Deploy"

✅ **Listo en Vercel!** Tu URL será: `https://planiverse.vercel.app`

---

## 📱 PLAY STORE (2-3 horas + 7 días revisión)

### Requisitos previos:
- ✅ App funcionando en Vercel
- ⚠️ Cuenta Google Play Console ($25 USD)
- ⚠️ Screenshots creados
- ⚠️ Feature graphic creado

### 1. Instalar Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### 2. Inicializar TWA
```bash
bubblewrap init --manifest https://tu-app.vercel.app/manifest.json
```

Responde:
- Package: `com.planiverse.app`
- App name: `Planiverse`
- Display: `standalone`
- Orientation: `portrait`

### 3. Construir AAB
```bash
bubblewrap build
```

### 4. Obtener SHA256 fingerprint
```bash
keytool -list -v -keystore android.keystore -alias android
```

Copia el SHA256 y actualiza `public/.well-known/assetlinks.json`

### 5. Deploy assetlinks a Vercel
```bash
git add public/.well-known/assetlinks.json
git commit -m "Add assetlinks for Play Store"
git push
```

### 6. Crear app en Play Console
1. Ve a [play.google.com/console](https://play.google.com/console)
2. "Crear aplicación"
3. Completa información básica
4. Sube screenshots y feature graphic
5. Sube el archivo `.aab`
6. Envía a revisión

⏳ **Espera 1-7 días** para aprobación de Google

---

## 📋 Archivos que necesitas crear

### Screenshots (usa Chrome DevTools):
1. `screenshot-mobile.png` (1080x1920px)
2. `screenshot-desktop.png` (1920x1080px)
3. 2-4 screenshots más para Play Store

### Feature Graphic:
- Usa [Canva](https://canva.com)
- Busca "Google Play Feature Graphic"
- Tamaño: 1024x500px

### Política de Privacidad:
- Usa [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- Súbela a `/privacy-policy` en tu app

---

## 🔍 Verificación rápida

### Antes de Vercel:
```bash
npm run build          # ✅ Sin errores
npm run verify-pwa     # ✅ PWA válida
```

### Después de Vercel:
1. Abre tu URL de Vercel
2. Chrome DevTools > Lighthouse
3. Ejecuta auditoría PWA
4. Score debe ser > 90

### Antes de Play Store:
- [ ] PWA funcionando en producción
- [ ] Screenshots creados (mínimo 2)
- [ ] Feature graphic creado
- [ ] Política de privacidad publicada
- [ ] assetlinks.json configurado
- [ ] AAB generado

---

## 🆘 Problemas comunes

### "Build failed" en Vercel
→ Verifica variables de entorno de Firebase

### "PWA not installable"
→ Verifica que manifest.json y sw.js sean accesibles

### "Digital Asset Links not verified"
→ Espera 24-48h después de subir assetlinks.json

---

## 📞 Soporte

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Play Store: [support.google.com/googleplay](https://support.google.com/googleplay/android-developer)
- Bubblewrap: [github.com/GoogleChromeLabs/bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)

¡Éxito con tu deployment! 🚀
