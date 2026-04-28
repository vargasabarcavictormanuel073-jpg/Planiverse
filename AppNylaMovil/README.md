# 📱 Planiverse - Organizador Personal PWA

Aplicación web progresiva (PWA) para organización personal, diseñada para estudiantes, profesores y profesionales.

## 🚀 Características

- ✅ **Tareas** - Gestión de tareas con prioridades y fechas
- 📅 **Calendario** - Visualización de eventos y evaluaciones
- 📝 **Notas** - Sistema de notas con etiquetas
- ⏰ **Recordatorios** - Notificaciones personalizadas
- 🔄 **Rutinas** - Gestión de rutinas diarias
- 🛠️ **Herramientas** - Suite de herramientas educativas

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Backend**: Firebase (Auth + Firestore)
- **PWA**: Service Workers + Manifest
- **Lenguaje**: TypeScript

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 🔧 Configuración de Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password y Google)
3. Crear base de datos Firestore
4. Copiar credenciales a `.env.local`

## 📁 Estructura del Proyecto

```
AppNylaMovil/
├── app/                    # Rutas de Next.js
├── components/
│   ├── layout/            # Componentes de layout
│   ├── modals/            # Componentes modales
│   ├── stats/             # Componentes de estadísticas
│   ├── tools/             # Herramientas educativas
│   ├── ui/                # Componentes UI reutilizables
│   └── wizard/            # Flujo de onboarding
├── firebase/              # Configuración y servicios de Firebase
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades y servicios
├── public/                # Assets estáticos
└── types/                 # Tipos TypeScript compartidos
```

## 🌐 PWA

La aplicación es una PWA completa con:
- ✅ Instalable en dispositivos móviles y desktop
- ✅ Funciona offline con Service Workers
- ✅ Notificaciones push
- ✅ Optimizada para rendimiento

## 📱 Compatibilidad

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Dispositivos móviles iOS y Android

## 🚀 Deploy

El proyecto está optimizado para Vercel:

```bash
# Deploy automático
vercel

# O conecta tu repositorio en vercel.com
```

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 👨‍💻 Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Linter
npm run lint

# Build de producción
npm run build
```

---

**Planiverse** - Tu organizador personal inteligente 🎯
