# Sistema de Autenticación y Perfiles de Usuario

Este directorio contiene la infraestructura base para el sistema de autenticación y perfiles de usuario de Planiverse.

## Estructura

```
lib/auth/
├── types.ts       # Definiciones de tipos TypeScript
├── constants.ts   # Constantes (STORAGE_KEYS, THEMES, reglas de validación)
├── index.ts       # Exportaciones centralizadas
└── README.md      # Este archivo
```

## Tipos Principales

### User
Modelo de usuario con credenciales de autenticación.
- `id`: UUID único del usuario
- `email`: Email único del usuario
- `passwordHash`: Hash de la contraseña (opcional para OAuth)
- `authMethod`: Método de autenticación ('email' | 'google')
- `createdAt`: Timestamp de creación
- `lastLogin`: Timestamp del último inicio de sesión

### UserProfile
Perfil de usuario con datos personales y preferencias.
- `userId`: Referencia al User.id
- `fullName`: Nombre completo del usuario
- `nickname`: Apodo (2-20 caracteres)
- `age`: Edad (5-120 años)
- `role`: Rol del usuario ('student' | 'teacher' | 'other')
- `selectedModules`: Array de módulos seleccionados
- `theme`: Tema visual aplicado
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de última actualización

### Session
Sesión activa del usuario.
- `userId`: Referencia al User.id
- `token`: Token de sesión (UUID)
- `createdAt`: Timestamp de creación
- `expiresAt`: Timestamp de expiración (7 días)

### Theme
Esquema de colores por rol.
- `role`: Rol asociado
- `colors`: Objeto con colores del tema (primary, secondary, accent, etc.)

## Constantes

### STORAGE_KEYS
Claves utilizadas en localStorage:
- `USERS`: 'planiverse_users' - Array de usuarios
- `PROFILES`: 'planiverse_profiles' - Record de perfiles por userId
- `SESSION`: 'planiverse_session' - Sesión activa
- `WIZARD_PROGRESS`: 'planiverse_wizard_progress' - Progreso del wizard

### THEMES
Temas predefinidos por rol:
- `student`: Esquema azul/verde (tonos calmados)
- `teacher`: Esquema naranja/rojo (tonos energéticos)
- `other`: Esquema morado/gris (tonos neutrales)

### VALIDATION_RULES
Reglas de validación:
- `PASSWORD_MIN_LENGTH`: 8 caracteres
- `NICKNAME_MIN_LENGTH`: 2 caracteres
- `NICKNAME_MAX_LENGTH`: 20 caracteres
- `AGE_MIN`: 5 años
- `AGE_MAX`: 120 años
- `SESSION_DURATION_DAYS`: 7 días

## Uso

```typescript
import {
  User,
  UserProfile,
  Session,
  Theme,
  STORAGE_KEYS,
  THEMES,
  VALIDATION_RULES
} from '@/lib/auth';

// Acceder a un tema
const studentTheme = THEMES.student;

// Usar claves de storage
const users = localStorage.getItem(STORAGE_KEYS.USERS);

// Validar contraseña
if (password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
  // Contraseña válida
}
```

## Próximos Pasos

Los siguientes componentes se implementarán en tareas posteriores:
- **Servicios** (Tarea 2-5): LocalStorageManager, ValidationService, AuthService, ThemeManager
- **Hooks** (Tarea 6): useAuth, useLocalStorage, useFormValidation, useTheme
- **Componentes** (Tarea 8-13): AuthStep, RegisterStep, UserDataStep, RoleSelectionStep, etc.
