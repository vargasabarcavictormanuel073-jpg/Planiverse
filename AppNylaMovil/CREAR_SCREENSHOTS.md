# 📸 Guía para Crear Screenshots

## Herramientas necesarias

### Opción 1: Chrome DevTools (Recomendado - Gratis)
1. Abre tu app en Chrome: `npm run dev`
2. Presiona F12 para abrir DevTools
3. Presiona Ctrl+Shift+M para modo responsive
4. Configura las resoluciones necesarias

### Opción 2: Herramientas online
- [Screely](https://screely.com) - Mockups automáticos
- [Mockuphone](https://mockuphone.com) - Frames de dispositivos
- [Smartmockups](https://smartmockups.com) - Mockups profesionales

## Screenshots requeridos

### Para PWA (manifest.json)

#### 1. Screenshot Móvil
- **Resolución**: 540x720px (o múltiplo: 1080x1440px)
- **Formato**: PNG
- **Nombre**: `screenshot-mobile.png`
- **Ubicación**: `/public/`

**Cómo capturar:**
```
1. Chrome DevTools > Responsive mode
2. Configurar: 540x720 (o 1080x1440)
3. Navega a la página principal
4. Ctrl+Shift+P > "Capture screenshot"
5. Guarda como screenshot-mobile.png
```

#### 2. Screenshot Desktop
- **Resolución**: 1280x720px (o 1920x1080px)
- **Formato**: PNG
- **Nombre**: `screenshot-desktop.png`
- **Ubicación**: `/public/`

**Cómo capturar:**
```
1. Chrome en modo normal (no responsive)
2. Ajusta ventana a 1280x720
3. Navega a la página principal
4. Extensión "Full Page Screen Capture" o F12 > Capture screenshot
5. Guarda como screenshot-desktop.png
```

### Para Google Play Store

#### 3. Screenshots de Teléfono (mínimo 2, máximo 8)
- **Resolución**: 1080x1920px (9:16 ratio)
- **Formato**: PNG o JPG
- **Peso máximo**: 8MB cada uno
- **Nombres sugeridos**: 
  - `playstore-phone-1.png` (Dashboard)
  - `playstore-phone-2.png` (Tareas)
  - `playstore-phone-3.png` (Calendario)
  - `playstore-phone-4.png` (Notas)

**Páginas recomendadas para capturar:**
1. Dashboard principal (`/dashboard`)
2. Lista de tareas (`/task`)
3. Calendario (`/calendar`)
4. Notas (`/notes`)
5. Herramientas (`/tools`)

**Cómo capturar:**
```
1. Chrome DevTools > Responsive
2. Configurar: 1080x1920
3. Navega a cada página
4. Captura screenshot
5. Guarda con nombre descriptivo
```

#### 4. Screenshots de Tablet 7" (opcional pero recomendado)
- **Resolución**: 1200x1920px
- **Formato**: PNG o JPG
- **Cantidad**: 2-8 screenshots

#### 5. Feature Graphic (OBLIGATORIO)
- **Resolución**: 1024x500px (exacto)
- **Formato**: PNG o JPG
- **Peso máximo**: 1MB
- **Nombre**: `feature-graphic.png`

**Contenido sugerido:**
- Logo de Planiverse
- Texto: "Tu Organizador Personal"
- Iconos de las funciones principales
- Colores del tema (#3B82F6)

**Herramientas para crear:**
- [Canva](https://canva.com) - Busca "Google Play Feature Graphic"
- [Figma](https://figma.com) - Template 1024x500px
- [Photopea](https://photopea.com) - Photoshop gratis online

#### 6. Icono de alta resolución
- **Resolución**: 512x512px
- **Formato**: PNG (32-bit)
- **Fondo**: Transparente o de color
- **Nombre**: `icon-512-playstore.png`

Ya tienes este archivo, solo verifica que:
- No tenga bordes redondeados (Google los agrega)
- Tenga zona segura de 66px desde los bordes
- Sea claro y legible

## Plantilla de captura rápida

### Script para automatizar capturas

Crea `scripts/capture-screenshots.js`:

```javascript
const puppeteer = require('puppeteer');

const pages = [
  { url: 'http://localhost:3000/dashboard', name: 'dashboard' },
  { url: 'http://localhost:3000/task', name: 'tasks' },
  { url: 'http://localhost:3000/calendar', name: 'calendar' },
  { url: 'http://localhost:3000/notes', name: 'notes' },
];

async function captureScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Móvil
  await page.setViewport({ width: 1080, height: 1920 });
  
  for (const pageInfo of pages) {
    await page.goto(pageInfo.url);
    await page.waitForTimeout(2000); // Espera carga
    await page.screenshot({ 
      path: `public/screenshots/phone-${pageInfo.name}.png` 
    });
  }
  
  // Desktop
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'public/screenshot-desktop.png' 
  });
  
  await browser.close();
}

captureScreenshots();
```

**Instalar y usar:**
```bash
npm install --save-dev puppeteer
node scripts/capture-screenshots.js
```

## Checklist de Screenshots

### Para PWA:
- [ ] screenshot-mobile.png (540x720 o mayor)
- [ ] screenshot-desktop.png (1280x720 o mayor)
- [ ] Ambos en `/public/`
- [ ] Referenciados en manifest.json

### Para Play Store:
- [ ] Mínimo 2 screenshots de teléfono (1080x1920)
- [ ] Feature graphic (1024x500)
- [ ] Icono 512x512 optimizado
- [ ] Screenshots muestran funcionalidad principal
- [ ] Sin información personal visible
- [ ] Buena iluminación y contraste

## Tips para buenos screenshots

1. **Usa datos de ejemplo realistas** (no "Test" o "Lorem ipsum")
2. **Muestra la funcionalidad principal** en cada screenshot
3. **Evita texto muy pequeño** que no se lea
4. **Usa el tema claro** (mejor visibilidad)
5. **Captura en estado "ideal"** (sin errores, bien poblado)
6. **Mantén consistencia** en el estilo entre screenshots
7. **Agrega anotaciones** si es necesario (flechas, texto)

## Optimización de imágenes

Antes de subir, optimiza tus imágenes:

```bash
# Instalar herramienta
npm install -g sharp-cli

# Optimizar PNG
sharp -i screenshot.png -o screenshot-optimized.png --png

# Convertir a WebP (más ligero)
sharp -i screenshot.png -o screenshot.webp --webp
```

O usa herramientas online:
- [TinyPNG](https://tinypng.com)
- [Squoosh](https://squoosh.app)
- [ImageOptim](https://imageoptim.com)

## Ejemplo de estructura final

```
public/
├── screenshot-mobile.png          # Para PWA
├── screenshot-desktop.png         # Para PWA
├── screenshots/                   # Para Play Store
│   ├── phone-1-dashboard.png
│   ├── phone-2-tasks.png
│   ├── phone-3-calendar.png
│   ├── phone-4-notes.png
│   ├── tablet-1-dashboard.png
│   └── tablet-2-tasks.png
├── feature-graphic.png            # Para Play Store
└── icon-512-playstore.png         # Para Play Store
```

¡Listo para crear tus screenshots! 📸
