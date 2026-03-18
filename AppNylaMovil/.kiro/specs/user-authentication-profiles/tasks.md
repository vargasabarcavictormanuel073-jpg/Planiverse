# Plan de Implementación: Sistema de Autenticación y Perfiles de Usuario

## Resumen

Este plan implementa el sistema de autenticación y perfiles de usuario para Planiverse, expandiendo el wizard existente de 3 a 5 pasos. La implementación incluye autenticación dual (OAuth Gmail simulado y email/password), recopilación de datos personales, selección de rol con temas visuales dinámicos, y persistencia en localStorage.

**Stack Tecnológico:**
- Next.js 14+ con App Router
- TypeScript
- Tailwind CSS
- React Testing Library + Jest
- fast-check para property-based testing

**Arquitectura:**
- Frontend-only (sin backend)
- Persistencia en localStorage
- Gestión de estado con React hooks
- Temas dinámicos con CSS variables

## Tareas

- [x] 1. Configurar infraestructura base y tipos
  - Crear tipos TypeScript para User, UserProfile, Session, Theme, AuthResult, ValidationResult
  - Definir constantes para STORAGE_KEYS y THEMES predefinidos
  - Configurar estructura de directorios para servicios, hooks y componentes
  - _Requisitos: 1.2, 2.1, 3.5, 4.5, 5.3, 6.1-6.3, 8.1_


- [x] 2. Implementar LocalStorageManager
  - [x] 2.1 Crear servicio LocalStorageManager con métodos CRUD para usuarios, perfiles y sesiones
    - Implementar saveUser, getUser, getUserByEmail
    - Implementar saveProfile, getProfile
    - Implementar saveSession, getSession, clearSession
    - Implementar isAvailable, getStorageSize, clearAll
    - Incluir manejo de errores para localStorage no disponible o lleno
    - _Requisitos: 1.2, 3.5, 4.5, 8.1, 13.1-13.5_
  
  - [ ]* 2.2 Escribir property test para persistencia de datos
    - **Property 2: OAuth Success Persistence** - Verificar que datos guardados sean recuperables
    - **Property 18: User Data Persistence** - Verificar round-trip de datos de usuario
    - **Property 19: Role Selection Persistence** - Verificar round-trip de selección de rol
    - **Property 21: Theme Persistence** - Verificar round-trip de tema
    - **Valida: Requisitos 1.2, 4.5, 5.3, 6.5**
  
  - [ ]* 2.3 Escribir unit tests para LocalStorageManager
    - Test de guardado y recuperación de usuarios
    - Test de manejo de localStorage no disponible
    - Test de manejo de localStorage lleno
    - Test de validación de escritura
    - _Requisitos: 13.1-13.5_

- [x] 3. Implementar ValidationService
  - [x] 3.1 Crear servicio ValidationService con reglas de validación
    - Implementar validateEmail con regex de formato válido
    - Implementar validatePassword (mínimo 8 caracteres)
    - Implementar validatePasswordMatch
    - Implementar validateName (no vacío)
    - Implementar validateNickname (2-20 caracteres)
    - Implementar validateAge (5-120 años)
    - _Requisitos: 2.2, 3.2, 3.3, 4.2, 4.3, 4.4_
  
  - [ ]* 3.2 Escribir property tests para validación
    - **Property 6: Email Format Validation** - Validar con emails generados aleatoriamente
    - **Property 10: Password Length Validation** - Validar con longitudes aleatorias
    - **Property 11: Password Confirmation Match** - Validar coincidencia de contraseñas
    - **Property 15: Full Name Non-Empty Validation** - Validar con strings aleatorios
    - **Property 16: Nickname Length Validation** - Validar con strings de longitud aleatoria
    - **Property 17: Age Range Validation** - Validar con números aleatorios
    - **Valida: Requisitos 2.2, 3.2, 3.3, 4.2, 4.3, 4.4**
  
  - [ ]* 3.3 Escribir unit tests para ValidationService
    - Test de validación de email válido e inválido
    - Test de validación de contraseña débil
    - Test de validación de edad fuera de rango
    - Test de validación de apodo con caracteres especiales
    - _Requisitos: 2.2, 3.2, 3.3, 4.2, 4.3, 4.4_


- [x] 4. Implementar AuthService con hashing de contraseñas
  - [x] 4.1 Crear servicio AuthService con métodos de autenticación
    - Implementar hashPassword usando Web Crypto API (SubtleCrypto)
    - Implementar verifyPassword para comparar hashes
    - Implementar login (email/password) con verificación de credenciales
    - Implementar register con validación de email único y hashing de contraseña
    - Implementar initiateGoogleOAuth (simulación frontend)
    - Implementar handleOAuthCallback (simulación frontend)
    - Implementar getCurrentSession, logout, isSessionValid
    - Generar tokens de sesión con UUID y timestamps
    - _Requisitos: 1.1-1.5, 2.1-2.6, 3.1-3.7, 8.1-8.5, 9.1-9.4_
  
  - [ ]* 4.2 Escribir property tests para AuthService
    - **Property 7: Credential Verification** - Verificar con credenciales aleatorias
    - **Property 12: Email Uniqueness Validation** - Verificar con emails aleatorios
    - **Property 13: Password Hashing on Registration** - Verificar que contraseñas no sean plaintext
    - **Property 25: Session Token Creation** - Verificar formato de tokens
    - **Property 29: Session Timestamp Inclusion** - Verificar presencia de timestamps
    - **Valida: Requisitos 2.3, 3.4, 3.5, 8.1, 8.5**
  
  - [ ]* 4.3 Escribir unit tests para AuthService
    - Test de login exitoso con credenciales correctas
    - Test de login fallido con credenciales incorrectas
    - Test de registro exitoso con email nuevo
    - Test de registro fallido con email existente
    - Test de OAuth simulado exitoso
    - Test de OAuth simulado fallido
    - Test de logout limpiando sesión
    - Test de validación de sesión expirada
    - _Requisitos: 1.1-1.5, 2.3-2.5, 3.4, 3.7, 8.2-8.4, 9.1-9.4_

- [x] 5. Implementar ThemeManager
  - [x] 5.1 Crear servicio ThemeManager para gestión de temas
    - Implementar getThemeForRole con mapeo de roles a temas
    - Implementar applyTheme que actualiza CSS custom properties
    - Implementar getCurrentTheme
    - Definir THEMES constante con colores para student, teacher, other
    - _Requisitos: 5.5, 6.1-6.6_
  
  - [ ]* 5.2 Escribir property test para asociación rol-tema
    - **Property 20: Role-Theme Association** - Verificar mapeo correcto de roles a temas
    - **Valida: Requisitos 5.5, 6.4**
  
  - [ ]* 5.3 Escribir unit tests para ThemeManager
    - Test de aplicación de tema student (azul/verde)
    - Test de aplicación de tema teacher (naranja/rojo)
    - Test de aplicación de tema other (morado/gris)
    - Test de actualización de CSS variables
    - _Requisitos: 6.1-6.3_


- [x] 6. Implementar hooks personalizados
  - [x] 6.1 Crear hook useLocalStorage
    - Implementar hook genérico para persistencia en localStorage
    - Incluir funciones de get, set y remove
    - Manejar serialización/deserialización JSON
    - Incluir manejo de errores
    - _Requisitos: 8.1, 13.1-13.5_
  
  - [x] 6.2 Crear hook useAuth
    - Implementar hook para gestión de autenticación
    - Exponer user, session, isAuthenticated, isLoading, error
    - Exponer funciones login, register, loginWithGoogle, logout
    - Integrar con AuthService y LocalStorageManager
    - _Requisitos: 1.1-1.5, 2.1-2.6, 3.1-3.7, 8.1-8.5, 9.1-9.4_
  
  - [x] 6.3 Crear hook useFormValidation
    - Implementar hook para validación de formularios en tiempo real
    - Gestionar values, errors, touched, isValid
    - Implementar handleChange con debounce (300ms)
    - Implementar handleBlur para marcar campos como touched
    - Integrar con ValidationService
    - _Requisitos: 10.1-10.5_
  
  - [x] 6.4 Crear hook useTheme
    - Implementar hook para gestión de temas
    - Exponer currentTheme, setTheme, applyTheme
    - Integrar con ThemeManager
    - Cargar tema desde localStorage al montar
    - _Requisitos: 5.5, 6.4-6.6_
  
  - [ ]* 6.5 Escribir unit tests para hooks
    - Test de useAuth con login exitoso y fallido
    - Test de useFormValidation con validación en tiempo real
    - Test de useTheme con cambio de tema
    - Test de useLocalStorage con persistencia
    - _Requisitos: 1.1-1.5, 2.1-2.6, 10.1-10.5, 6.4-6.6_

- [ ] 7. Checkpoint - Verificar servicios y hooks
  - Asegurar que todos los tests pasen
  - Verificar que los servicios funcionen correctamente de forma aislada
  - Preguntar al usuario si hay dudas o ajustes necesarios


- [x] 8. Implementar componente StepIndicator actualizado
  - [x] 8.1 Actualizar StepIndicator existente para 5 pasos
    - Modificar para mostrar 5 pasos en lugar de 3
    - Implementar indicadores visuales para paso actual, completados y futuros
    - Agregar íconos de verificación para pasos completados
    - Aplicar estilos con tema dinámico
    - Incluir animaciones suaves en transiciones
    - _Requisitos: 12.1-12.5_
  
  - [ ]* 8.2 Escribir property tests para StepIndicator
    - **Property 38: Progress Indicator Update** - Verificar actualización correcta del indicador
    - **Property 40: Completed Steps Indicator** - Verificar marcado de pasos completados
    - **Property 41: Future Steps Inactive State** - Verificar estado inactivo de pasos futuros
    - **Valida: Requisitos 12.2-12.4**
  
  - [ ]* 8.3 Escribir unit tests para StepIndicator
    - Test de renderizado con 5 pasos
    - Test de resaltado del paso actual
    - Test de marcado de pasos completados
    - Test de aplicación de tema
    - _Requisitos: 12.1-12.5_

- [x] 9. Implementar componente AuthStep (Paso 1)
  - [x] 9.1 Crear componente AuthStep con opciones de autenticación
    - Renderizar botón "Iniciar sesión con Gmail"
    - Renderizar botón "Iniciar sesión con email"
    - Implementar formulario de login con campos email y contraseña
    - Integrar con useAuth hook
    - Manejar flujo OAuth simulado
    - Verificar si usuario existe y redirigir a dashboard o continuar wizard
    - Mostrar mensajes de error descriptivos
    - Incluir atributos ARIA para accesibilidad
    - _Requisitos: 1.1-1.5, 2.1-2.6, 8.3-8.4, 14.1-14.6_
  
  - [ ]* 9.2 Escribir property tests para AuthStep
    - **Property 1: OAuth Flow Initiation** - Verificar inicio de flujo OAuth
    - **Property 3: Existing User Recognition** - Verificar reconocimiento de usuarios existentes
    - **Property 4: New User Wizard Flow** - Verificar continuación a paso 3 para nuevos usuarios
    - **Property 8: Successful Login Session Creation** - Verificar creación de sesión
    - **Valida: Requisitos 1.1, 1.3, 1.4, 2.4**
  
  - [ ]* 9.3 Escribir unit tests para AuthStep
    - Test de renderizado de botones de autenticación
    - Test de click en "Iniciar sesión con Gmail"
    - Test de login exitoso con email/password
    - Test de login fallido mostrando error
    - Test de navegación a paso de registro
    - Test de accesibilidad con navegación por teclado
    - _Requisitos: 1.1-1.5, 2.1-2.6, 14.1-14.6_


- [x] 10. Implementar componente RegisterStep (Paso 2)
  - [x] 10.1 Crear componente RegisterStep para registro de usuarios
    - Renderizar formulario con campos email, contraseña y confirmación
    - Integrar con useFormValidation hook
    - Validar formato de email en tiempo real
    - Validar longitud de contraseña (mínimo 8 caracteres)
    - Validar coincidencia de contraseñas
    - Verificar que email no esté registrado
    - Mostrar mensajes de error inline
    - Deshabilitar botón "Siguiente" si hay errores
    - Implementar botón "Atrás" para volver a paso 1
    - Incluir atributos ARIA y navegación por teclado
    - _Requisitos: 3.1-3.7, 10.1-10.5, 11.1-11.2, 14.1-14.6_
  
  - [ ]* 10.2 Escribir property tests para RegisterStep
    - **Property 14: Registration Success Navigation** - Verificar navegación a paso 3
    - **Property 33: Real-Time Validation** - Verificar validación en tiempo real
    - **Property 34: Next Button Disabled on Errors** - Verificar deshabilitación de botón
    - **Property 35: Error Visual Indicators** - Verificar indicadores visuales de error
    - **Valida: Requisitos 3.6, 10.1-10.3**
  
  - [ ]* 10.3 Escribir unit tests para RegisterStep
    - Test de registro exitoso con datos válidos
    - Test de error con email existente
    - Test de error con contraseña débil
    - Test de error con contraseñas no coincidentes
    - Test de validación en tiempo real
    - Test de navegación hacia atrás
    - Test de accesibilidad
    - _Requisitos: 3.1-3.7, 10.1-10.5, 11.1-11.2, 14.1-14.6_

- [x] 11. Implementar componente UserDataStep (Paso 3)
  - [x] 11.1 Crear componente UserDataStep para datos personales
    - Renderizar formulario con campos nombre completo, apodo y edad
    - Integrar con useFormValidation hook
    - Validar nombre completo no vacío
    - Validar apodo entre 2-20 caracteres
    - Validar edad entre 5-120 años
    - Mostrar mensajes de error inline
    - Guardar datos en perfil de usuario
    - Implementar botones "Atrás" y "Siguiente"
    - Preservar datos al navegar
    - Incluir atributos ARIA y navegación por teclado
    - _Requisitos: 4.1-4.6, 10.1-10.5, 11.1-11.3, 14.1-14.6_
  
  - [ ]* 11.2 Escribir property tests para UserDataStep
    - **Property 37: Data Preservation on Navigation** - Verificar preservación de datos
    - **Property 39: Forward Navigation Validation** - Verificar prevención de navegación con errores
    - **Valida: Requisitos 11.3, 11.5**
  
  - [ ]* 11.3 Escribir unit tests para UserDataStep
    - Test de guardado exitoso con datos válidos
    - Test de error con nombre vacío
    - Test de error con apodo muy corto o largo
    - Test de error con edad fuera de rango
    - Test de navegación hacia atrás preservando datos
    - Test de accesibilidad
    - _Requisitos: 4.1-4.6, 10.1-10.5, 11.1-11.3, 14.1-14.6_


- [x] 12. Implementar componente RoleSelectionStep (Paso 4)
  - [x] 12.1 Crear componente RoleSelectionStep para selección de rol
    - Renderizar tres opciones de rol: Estudiante, Maestro, Otro
    - Mostrar vista previa de esquema de colores para cada rol
    - Aplicar tema temporalmente al seleccionar rol
    - Guardar rol seleccionado en perfil de usuario
    - Implementar botones "Atrás" y "Siguiente"
    - Preservar selección al navegar
    - Incluir atributos ARIA y navegación por teclado
    - _Requisitos: 5.1-5.5, 6.1-6.6, 11.1-11.3, 14.1-14.6_
  
  - [ ]* 12.2 Escribir property test para carga de tema
    - **Property 22: Theme Loading on Login** - Verificar carga automática de tema
    - **Valida: Requisitos 6.6**
  
  - [ ]* 12.3 Escribir unit tests para RoleSelectionStep
    - Test de selección de rol Estudiante y aplicación de tema azul/verde
    - Test de selección de rol Maestro y aplicación de tema naranja/rojo
    - Test de selección de rol Otro y aplicación de tema morado/gris
    - Test de persistencia de rol en localStorage
    - Test de navegación hacia atrás preservando selección
    - Test de accesibilidad
    - _Requisitos: 5.1-5.5, 6.1-6.6, 11.1-11.3, 14.1-14.6_

- [x] 13. Actualizar componente ModuleSelectionStep (Paso 5)
  - [x] 13.1 Adaptar ModuleSelectionStep existente con temas dinámicos
    - Aplicar tema del rol seleccionado a tarjetas de módulos
    - Guardar módulos seleccionados en perfil de usuario
    - Implementar botón "Crear mi Planiverse" para finalizar
    - Implementar botón "Atrás"
    - Guardar configuración completa en localStorage al finalizar
    - Redirigir a dashboard después de completar
    - Incluir atributos ARIA y navegación por teclado
    - _Requisitos: 7.1-7.5, 11.1-11.3, 14.1-14.6_
  
  - [ ]* 13.2 Escribir property tests para ModuleSelectionStep
    - **Property 23: Module Selection Persistence** - Verificar persistencia de módulos
    - **Property 24: Complete Configuration Persistence** - Verificar guardado completo
    - **Valida: Requisitos 7.3, 7.4**
  
  - [ ]* 13.3 Escribir unit tests para ModuleSelectionStep
    - Test de selección de módulos con tema aplicado
    - Test de guardado de configuración completa
    - Test de redirección a dashboard
    - Test de navegación hacia atrás
    - Test de accesibilidad
    - _Requisitos: 7.1-7.5, 11.1-11.3, 14.1-14.6_

- [ ] 14. Checkpoint - Verificar componentes individuales
  - Asegurar que todos los tests de componentes pasen
  - Verificar que cada paso del wizard funcione de forma aislada
  - Verificar accesibilidad con navegación por teclado
  - Preguntar al usuario si hay dudas o ajustes necesarios


- [x] 15. Implementar componente WizardContainer
  - [x] 15.1 Crear componente WizardContainer para orquestar el flujo
    - Gestionar estado global del wizard (currentStep, completedSteps, wizardProgress)
    - Implementar lógica de navegación entre pasos
    - Verificar sesión existente al cargar y redirigir si es válida
    - Persistir progreso del wizard en localStorage
    - Aplicar tema dinámicamente según rol seleccionado
    - Renderizar StepIndicator y paso actual
    - Manejar callbacks de cada paso (onComplete, onBack, onError)
    - Implementar lógica de validación antes de avanzar
    - _Requisitos: 8.1-8.5, 11.1-11.5, 12.1-12.5_
  
  - [ ]* 15.2 Escribir property tests para WizardContainer
    - **Property 26: Session Validation on Load** - Verificar validación de sesión al cargar
    - **Property 27: Valid Session Auto-Login** - Verificar auto-login con sesión válida
    - **Property 28: Invalid Session Redirect** - Verificar redirección sin sesión válida
    - **Property 36: Back Button Visibility** - Verificar visibilidad de botón Atrás
    - **Valida: Requisitos 8.2-8.4, 11.1**
  
  - [ ]* 15.3 Escribir unit tests para WizardContainer
    - Test de carga con sesión válida (redirige a dashboard)
    - Test de carga sin sesión (muestra paso 1)
    - Test de navegación completa del paso 1 al 5
    - Test de navegación hacia atrás preservando datos
    - Test de persistencia de progreso en localStorage
    - Test de aplicación de tema después de selección de rol
    - _Requisitos: 8.1-8.5, 11.1-11.5, 12.1-12.5_

- [ ] 16. Implementar lógica de sesión y logout
  - [ ] 16.1 Agregar funcionalidad de logout en la aplicación
    - Crear componente o botón de logout en el dashboard/header
    - Implementar lógica de logout usando useAuth hook
    - Limpiar sesión de localStorage
    - Limpiar datos de sesión en memoria
    - Redirigir a paso 1 del wizard
    - Mantener perfil de usuario en localStorage
    - _Requisitos: 9.1-9.4_
  
  - [ ]* 16.2 Escribir property tests para logout
    - **Property 30: Logout Session Removal** - Verificar eliminación de sesión
    - **Property 31: Logout Memory Cleanup** - Verificar limpieza de memoria
    - **Property 32: Profile Persistence After Logout** - Verificar que perfil permanece
    - **Valida: Requisitos 9.1, 9.2, 9.4**
  
  - [ ]* 16.3 Escribir unit tests para logout
    - Test de logout eliminando sesión
    - Test de logout manteniendo perfil
    - Test de redirección después de logout
    - _Requisitos: 9.1-9.4_


- [ ] 17. Implementar manejo de errores de localStorage
  - [ ] 17.1 Agregar manejo robusto de errores de localStorage
    - Detectar disponibilidad de localStorage al cargar aplicación
    - Mostrar advertencia si localStorage no está disponible
    - Capturar errores de cuota excedida (QuotaExceededError)
    - Mostrar mensaje al usuario sugiriendo limpiar datos antiguos
    - Implementar fallback en memoria si localStorage no disponible
    - Validar escrituras leyendo datos después de guardar
    - _Requisitos: 13.1-13.5_
  
  - [ ]* 17.2 Escribir property tests para manejo de errores
    - **Property 42: localStorage Availability Detection** - Verificar detección de disponibilidad
    - **Property 43: Storage Full Error Handling** - Verificar manejo de cuota excedida
    - **Property 44: Write Validation** - Verificar validación de escrituras
    - **Valida: Requisitos 13.1, 13.2, 13.5**
  
  - [ ]* 17.3 Escribir unit tests para manejo de errores
    - Test de detección de localStorage no disponible
    - Test de manejo de QuotaExceededError
    - Test de fallback en memoria
    - Test de validación de escritura
    - _Requisitos: 13.1-13.5_

- [ ] 18. Implementar accesibilidad completa
  - [ ] 18.1 Agregar atributos ARIA y soporte de teclado
    - Agregar roles ARIA apropiados a todos los componentes interactivos
    - Agregar aria-label, aria-describedby donde sea necesario
    - Implementar aria-live regions para anuncios de cambio de paso
    - Implementar aria-live regions para anuncios de errores de validación
    - Asegurar que todos los elementos interactivos sean accesibles por teclado
    - Implementar indicadores de foco visibles con suficiente contraste
    - Verificar orden de tabulación lógico
    - _Requisitos: 14.1-14.6_
  
  - [ ]* 18.2 Escribir property tests para accesibilidad
    - **Property 45: Keyboard Navigation** - Verificar navegación completa por teclado
    - **Property 46: ARIA Attributes Presence** - Verificar presencia de atributos ARIA
    - **Property 47: Step Change Announcements** - Verificar anuncios de cambio de paso
    - **Property 48: Focus Visibility** - Verificar visibilidad de foco
    - **Property 50: Validation Error Announcements** - Verificar anuncios de errores
    - **Valida: Requisitos 14.1-14.4, 14.6**
  
  - [ ]* 18.3 Escribir unit tests para accesibilidad
    - Test de navegación por teclado en cada paso
    - Test de presencia de atributos ARIA
    - Test de anuncios a lectores de pantalla
    - Test de indicadores de foco visibles
    - Test con herramienta axe-core
    - _Requisitos: 14.1-14.6_


- [ ] 19. Implementar responsividad completa
  - [ ] 19.1 Adaptar todos los componentes para múltiples tamaños de pantalla
    - Implementar breakpoints con Tailwind CSS (sm, md, lg, xl)
    - Adaptar layout del wizard para pantallas desde 320px
    - Ajustar tamaño de botones para touch en móviles (mínimo 44x44px)
    - Reorganizar formularios en pantallas pequeñas (columna única)
    - Ajustar tamaño de fuentes para legibilidad en todos los tamaños
    - Prevenir scroll horizontal en todos los tamaños de pantalla
    - Probar en dispositivos móviles, tablets y desktop
    - _Requisitos: 15.1-15.5_
  
  - [ ]* 19.2 Escribir property tests para responsividad
    - **Property 51: Responsive Layout Adaptation** - Verificar adaptación de layout
    - **Property 52: Touch Target Sizing** - Verificar tamaño de targets táctiles
    - **Property 53: Functional Completeness Across Viewports** - Verificar funcionalidad completa
    - **Valida: Requisitos 15.2-15.5**
  
  - [ ]* 19.3 Escribir unit tests para responsividad
    - Test de renderizado en 320px (móvil pequeño)
    - Test de renderizado en 768px (tablet)
    - Test de renderizado en 1920px (desktop)
    - Test de tamaño de botones en móvil
    - Test de funcionalidad completa en todos los tamaños
    - _Requisitos: 15.1-15.5_

- [ ] 20. Implementar contraste de color WCAG AA
  - [ ] 20.1 Verificar y ajustar contraste de colores en todos los temas
    - Verificar contraste de texto normal (4.5:1 mínimo)
    - Verificar contraste de texto grande (3:1 mínimo)
    - Verificar contraste de elementos interactivos (3:1 mínimo)
    - Ajustar colores de temas si no cumplen con WCAG AA
    - Probar con herramientas de contraste (Chrome DevTools, axe)
    - _Requisitos: 14.5_
  
  - [ ]* 20.2 Escribir property test para contraste de color
    - **Property 49: Color Contrast Compliance** - Verificar ratios de contraste para todos los temas
    - **Valida: Requisitos 14.5**
  
  - [ ]* 20.3 Escribir unit tests para contraste de color
    - Test de contraste en tema student
    - Test de contraste en tema teacher
    - Test de contraste en tema other
    - _Requisitos: 14.5_

- [ ] 21. Checkpoint - Verificar integración completa
  - Asegurar que todos los tests pasen (unit y property tests)
  - Probar flujo completo del wizard manualmente
  - Verificar persistencia de datos entre recargas
  - Verificar accesibilidad con lector de pantalla
  - Verificar responsividad en diferentes dispositivos
  - Preguntar al usuario si hay dudas o ajustes necesarios


- [ ] 22. Escribir tests de integración end-to-end
  - [ ]* 22.1 Crear tests de integración para flujos completos
    - Test de flujo completo: OAuth → Datos → Rol → Módulos → Dashboard
    - Test de flujo completo: Registro → Datos → Rol → Módulos → Dashboard
    - Test de flujo completo: Login → Dashboard (usuario existente)
    - Test de persistencia: Completar wizard → Recargar → Verificar sesión activa
    - Test de logout: Dashboard → Logout → Wizard paso 1
    - Test de navegación: Avanzar y retroceder preservando datos
    - Test de errores: Manejo de localStorage no disponible
    - Test de errores: Manejo de localStorage lleno
    - _Requisitos: 1.1-1.5, 2.1-2.6, 3.1-3.7, 4.1-4.6, 5.1-5.5, 7.1-7.5, 8.1-8.5, 9.1-9.4, 11.1-11.5, 13.1-13.5_

- [ ] 23. Integrar wizard con aplicación Next.js existente
  - [ ] 23.1 Conectar wizard con rutas de Next.js
    - Crear ruta /wizard para el WizardContainer
    - Crear ruta /dashboard (o usar existente)
    - Implementar middleware o layout para verificar sesión
    - Redirigir a /wizard si no hay sesión válida
    - Redirigir a /dashboard si hay sesión válida
    - Actualizar navegación existente para incluir logout
    - _Requisitos: 8.1-8.5, 9.1-9.4_
  
  - [ ] 23.2 Aplicar tema global a la aplicación
    - Cargar tema del usuario al iniciar aplicación
    - Aplicar CSS variables globalmente
    - Actualizar componentes existentes para usar variables de tema
    - Persistir tema entre navegaciones
    - _Requisitos: 6.4-6.6_
  
  - [ ]* 23.3 Escribir tests de integración con Next.js
    - Test de redirección a /wizard sin sesión
    - Test de redirección a /dashboard con sesión
    - Test de aplicación de tema global
    - Test de persistencia de tema entre navegaciones
    - _Requisitos: 6.4-6.6, 8.1-8.5_

- [ ] 24. Optimizar rendimiento y experiencia de usuario
  - [ ] 24.1 Implementar optimizaciones de rendimiento
    - Agregar debounce a validación de formularios (300ms)
    - Implementar lazy loading de pasos del wizard si es necesario
    - Optimizar re-renders con React.memo donde sea apropiado
    - Minimizar operaciones de localStorage (batch writes)
    - Agregar loading states durante operaciones asíncronas
    - Agregar animaciones suaves en transiciones de pasos
    - _Requisitos: 10.5, 12.5_
  
  - [ ] 24.2 Mejorar feedback visual al usuario
    - Agregar spinners durante autenticación OAuth
    - Agregar animaciones de éxito al completar pasos
    - Agregar transiciones suaves al cambiar temas
    - Agregar tooltips explicativos donde sea necesario
    - Mejorar mensajes de error para ser más descriptivos
    - _Requisitos: 1.5, 2.5, 10.1_


- [ ] 25. Documentar código y crear guía de uso
  - [ ] 25.1 Agregar documentación inline al código
    - Documentar interfaces TypeScript con JSDoc
    - Agregar comentarios explicativos en lógica compleja
    - Documentar props de componentes
    - Documentar funciones de servicios y hooks
    - Agregar ejemplos de uso en comentarios
  
  - [ ] 25.2 Crear README para el sistema de autenticación
    - Documentar arquitectura del sistema
    - Documentar flujo del wizard
    - Documentar estructura de datos en localStorage
    - Documentar cómo agregar nuevos temas
    - Documentar cómo extender validaciones
    - Incluir ejemplos de uso de hooks y servicios

- [ ] 26. Checkpoint final - Verificación completa del sistema
  - Ejecutar todos los tests (unit, property, integration)
  - Verificar cobertura de tests (>80% líneas, >75% branches)
  - Probar flujo completo manualmente en diferentes navegadores
  - Verificar accesibilidad con herramientas automatizadas (axe, Lighthouse)
  - Verificar responsividad en dispositivos reales
  - Verificar rendimiento con Chrome DevTools
  - Revisar código para mejores prácticas
  - Asegurar que no hay console.errors en producción
  - Preguntar al usuario si está satisfecho con la implementación

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades universales de corrección
- Los unit tests validan ejemplos específicos y casos edge
- La implementación sigue el diseño técnico documentado en design.md
- Se recomienda ejecutar tests frecuentemente durante el desarrollo
- La accesibilidad y responsividad son requisitos críticos, no opcionales

## Configuración de Testing

### Instalación de Dependencias

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev fast-check
npm install --save-dev @axe-core/react
```

### Configuración de fast-check

Todos los property tests deben ejecutarse con mínimo 100 iteraciones:

```typescript
fc.assert(fc.property(...), { numRuns: 100 });
```

### Etiquetas de Property Tests

Cada property test debe incluir un comentario con el formato:

```typescript
// Feature: user-authentication-profiles, Property {N}: {Property Title}
```

Esto permite rastrear qué propiedad del diseño está siendo verificada.
