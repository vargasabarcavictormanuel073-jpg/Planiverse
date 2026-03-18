# Requirements Document

## Introduction

Este documento define los requisitos para migrar la aplicación Planiverse de un sistema de persistencia basado en localStorage a Firebase (Authentication y Firestore). La migración debe mantener toda la funcionalidad existente, preservar los datos actuales durante la transición, y proporcionar una base escalable para el crecimiento futuro de la aplicación.

## Glossary

- **Planiverse**: La aplicación web de gestión personal construida con Next.js 14+
- **Firebase_Auth**: Servicio de autenticación de Firebase que gestiona usuarios y sesiones
- **Firestore**: Base de datos NoSQL en tiempo real de Firebase
- **LocalStorage_Manager**: Servicio actual que gestiona la persistencia en localStorage del navegador
- **Auth_Service**: Servicio que maneja la lógica de autenticación y registro
- **Migration_Service**: Servicio que transfiere datos de localStorage a Firestore
- **User_Document**: Documento en Firestore que contiene datos del usuario en la colección users
- **Module_Data**: Datos de los módulos de la aplicación (tareas, notas, calendario, rutinas, recordatorios)
- **Session_Token**: Token de autenticación gestionado por Firebase Auth
- **User_Profile**: Datos del perfil del usuario (nombre, edad, rol, módulos seleccionados, tema)

## Requirements

### Requirement 1: Migrar Autenticación a Firebase Authentication

**User Story:** Como usuario de Planiverse, quiero que mi autenticación sea gestionada por Firebase Authentication, para que mis credenciales estén seguras y pueda acceder desde cualquier dispositivo.

#### Acceptance Criteria

1. WHEN un usuario se registra con email y contraseña, THE Firebase_Auth SHALL crear una cuenta de usuario y retornar el UID
2. WHEN un usuario inicia sesión con email y contraseña, THE Firebase_Auth SHALL validar las credenciales y crear una sesión autenticada
3. WHEN un usuario inicia sesión con Google OAuth, THE Firebase_Auth SHALL autenticar mediante el proveedor de Google y crear una sesión
4. WHEN un usuario cierra sesión, THE Firebase_Auth SHALL invalidar la sesión actual y limpiar el estado de autenticación
5. WHEN Firebase_Auth detecta un cambio en el estado de autenticación, THE Auth_Service SHALL actualizar el estado global de la aplicación
6. THE Auth_Service SHALL almacenar el Session_Token de Firebase en memoria (no en localStorage)
7. WHEN un usuario intenta acceder a una ruta protegida sin autenticación, THE Auth_Service SHALL redirigir al usuario a la página de login

### Requirement 2: Migrar Datos de Usuario a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis datos de perfil se almacenen en Firestore, para que estén disponibles en cualquier dispositivo y no se pierdan si limpio el navegador.

#### Acceptance Criteria

1. WHEN un usuario completa el registro, THE Auth_Service SHALL crear un User_Document en Firestore con email, role, createdAt y authMethod
2. WHEN un usuario completa el wizard de configuración, THE Auth_Service SHALL actualizar el User_Document con los datos del User_Profile
3. THE User_Document SHALL almacenar: email, role, fullName, nickname, age, selectedModules, theme, createdAt, updatedAt
4. WHEN un usuario actualiza su perfil, THE Auth_Service SHALL actualizar el User_Document en Firestore en tiempo real
5. WHEN un usuario inicia sesión, THE Auth_Service SHALL recuperar el User_Document desde Firestore usando el UID de Firebase
6. IF la lectura del User_Document falla, THEN THE Auth_Service SHALL mostrar un mensaje de error descriptivo al usuario

### Requirement 3: Migrar Módulo de Tareas a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis tareas se almacenen en Firestore, para que estén sincronizadas en todos mis dispositivos.

#### Acceptance Criteria

1. WHEN un usuario crea una tarea, THE Planiverse SHALL guardar la tarea en la subcolección users/{userId}/tasks
2. WHEN un usuario actualiza una tarea, THE Planiverse SHALL actualizar el documento correspondiente en Firestore
3. WHEN un usuario elimina una tarea, THE Planiverse SHALL eliminar el documento correspondiente de Firestore
4. WHEN un usuario carga el módulo de tareas, THE Planiverse SHALL recuperar todas las tareas desde Firestore ordenadas por fecha de creación
5. THE Planiverse SHALL escuchar cambios en tiempo real en la colección de tareas y actualizar la UI automáticamente
6. FOR ALL operaciones de tareas, THE Planiverse SHALL validar que el usuario esté autenticado antes de ejecutar la operación

### Requirement 4: Migrar Módulo de Notas a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis notas se almacenen en Firestore, para que pueda acceder a ellas desde cualquier dispositivo.

#### Acceptance Criteria

1. WHEN un usuario crea una nota, THE Planiverse SHALL guardar la nota en la subcolección users/{userId}/notes
2. WHEN un usuario actualiza una nota, THE Planiverse SHALL actualizar el documento correspondiente en Firestore
3. WHEN un usuario elimina una nota, THE Planiverse SHALL eliminar el documento correspondiente de Firestore
4. WHEN un usuario carga el módulo de notas, THE Planiverse SHALL recuperar todas las notas desde Firestore ordenadas por fecha de actualización
5. THE Planiverse SHALL escuchar cambios en tiempo real en la colección de notas y actualizar la UI automáticamente
6. FOR ALL operaciones de notas, THE Planiverse SHALL validar que el usuario esté autenticado antes de ejecutar la operación

### Requirement 5: Migrar Módulo de Calendario a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis eventos de calendario se almacenen en Firestore, para que estén sincronizados en todos mis dispositivos.

#### Acceptance Criteria

1. WHEN un usuario crea un evento, THE Planiverse SHALL guardar el evento en la subcolección users/{userId}/calendar
2. WHEN un usuario actualiza un evento, THE Planiverse SHALL actualizar el documento correspondiente en Firestore
3. WHEN un usuario elimina un evento, THE Planiverse SHALL eliminar el documento correspondiente de Firestore
4. WHEN un usuario carga el módulo de calendario, THE Planiverse SHALL recuperar todos los eventos desde Firestore ordenados por fecha del evento
5. THE Planiverse SHALL escuchar cambios en tiempo real en la colección de calendario y actualizar la UI automáticamente
6. FOR ALL operaciones de calendario, THE Planiverse SHALL validar que el usuario esté autenticado antes de ejecutar la operación

### Requirement 6: Migrar Módulo de Rutinas a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis rutinas se almacenen en Firestore, para que estén disponibles en todos mis dispositivos.

#### Acceptance Criteria

1. WHEN un usuario crea una rutina, THE Planiverse SHALL guardar la rutina en la subcolección users/{userId}/routines
2. WHEN un usuario actualiza una rutina, THE Planiverse SHALL actualizar el documento correspondiente en Firestore
3. WHEN un usuario elimina una rutina, THE Planiverse SHALL eliminar el documento correspondiente de Firestore
4. WHEN un usuario carga el módulo de rutinas, THE Planiverse SHALL recuperar todas las rutinas desde Firestore ordenadas por fecha de creación
5. THE Planiverse SHALL escuchar cambios en tiempo real en la colección de rutinas y actualizar la UI automáticamente
6. FOR ALL operaciones de rutinas, THE Planiverse SHALL validar que el usuario esté autenticado antes de ejecutar la operación

### Requirement 7: Migrar Módulo de Recordatorios a Firestore

**User Story:** Como usuario de Planiverse, quiero que mis recordatorios se almacenen en Firestore, para que no se pierdan y estén sincronizados.

#### Acceptance Criteria

1. WHEN un usuario crea un recordatorio, THE Planiverse SHALL guardar el recordatorio en la subcolección users/{userId}/reminders
2. WHEN un usuario actualiza un recordatorio, THE Planiverse SHALL actualizar el documento correspondiente en Firestore
3. WHEN un usuario elimina un recordatorio, THE Planiverse SHALL eliminar el documento correspondiente de Firestore
4. WHEN un usuario carga el módulo de recordatorios, THE Planiverse SHALL recuperar todos los recordatorios desde Firestore ordenados por fecha de recordatorio
5. THE Planiverse SHALL escuchar cambios en tiempo real en la colección de recordatorios y actualizar la UI automáticamente
6. FOR ALL operaciones de recordatorios, THE Planiverse SHALL validar que el usuario esté autenticado antes de ejecutar la operación

### Requirement 8: Implementar Servicio de Migración de Datos

**User Story:** Como usuario existente de Planiverse, quiero que mis datos actuales en localStorage se migren automáticamente a Firebase, para que no pierda ninguna información durante la transición.

#### Acceptance Criteria

1. WHEN un usuario con datos en localStorage inicia sesión por primera vez después de la migración, THE Migration_Service SHALL detectar la presencia de datos en localStorage
2. WHEN Migration_Service detecta datos en localStorage, THE Migration_Service SHALL transferir todos los datos del usuario a Firestore preservando la estructura
3. WHEN la migración se completa exitosamente, THE Migration_Service SHALL marcar los datos como migrados en localStorage sin eliminarlos inmediatamente
4. WHEN la migración falla parcialmente, THE Migration_Service SHALL registrar los errores y permitir reintentos sin duplicar datos
5. THE Migration_Service SHALL migrar en el siguiente orden: User_Profile, tareas, notas, calendario, rutinas, recordatorios
6. WHEN todos los datos se han migrado y verificado, THE Migration_Service SHALL mostrar una notificación de éxito al usuario
7. THE Migration_Service SHALL proporcionar un reporte de migración indicando qué datos se migraron y si hubo errores

### Requirement 9: Implementar Manejo de Errores y Reintentos

**User Story:** Como usuario de Planiverse, quiero que la aplicación maneje errores de red y Firebase de manera elegante, para que tenga una experiencia fluida incluso con conexión inestable.

#### Acceptance Criteria

1. WHEN una operación de Firestore falla por problemas de red, THE Planiverse SHALL reintentar la operación hasta 3 veces con backoff exponencial
2. WHEN una operación falla después de todos los reintentos, THE Planiverse SHALL mostrar un mensaje de error descriptivo al usuario
3. WHEN Firebase_Auth detecta que la sesión expiró, THE Planiverse SHALL redirigir al usuario a la página de login con un mensaje informativo
4. WHEN Firestore está en modo offline, THE Planiverse SHALL usar el caché local de Firestore y sincronizar cuando vuelva la conexión
5. THE Planiverse SHALL mostrar un indicador visual cuando esté operando en modo offline
6. WHEN una operación de escritura falla, THE Planiverse SHALL preservar los datos localmente y permitir al usuario reintentar manualmente

### Requirement 10: Implementar Reglas de Seguridad en Firestore

**User Story:** Como administrador de Planiverse, quiero que las reglas de seguridad de Firestore protejan los datos de los usuarios, para que solo puedan acceder a su propia información.

#### Acceptance Criteria

1. THE Firestore SHALL permitir lectura y escritura en users/{userId} solo si el usuario autenticado tiene el mismo UID
2. THE Firestore SHALL permitir lectura y escritura en users/{userId}/tasks/{taskId} solo si el usuario autenticado tiene el mismo UID
3. THE Firestore SHALL permitir lectura y escritura en users/{userId}/notes/{noteId} solo si el usuario autenticado tiene el mismo UID
4. THE Firestore SHALL permitir lectura y escritura en users/{userId}/calendar/{eventId} solo si el usuario autenticado tiene el mismo UID
5. THE Firestore SHALL permitir lectura y escritura en users/{userId}/routines/{routineId} solo si el usuario autenticado tiene el mismo UID
6. THE Firestore SHALL permitir lectura y escritura en users/{userId}/reminders/{reminderId} solo si el usuario autenticado tiene el mismo UID
7. THE Firestore SHALL rechazar todas las operaciones de usuarios no autenticados excepto en rutas públicas

### Requirement 11: Actualizar Componentes para Usar Firebase

**User Story:** Como desarrollador de Planiverse, quiero que todos los componentes usen Firebase en lugar de localStorage, para que la aplicación sea consistente y mantenible.

#### Acceptance Criteria

1. THE Auth_Service SHALL reemplazar todas las llamadas a LocalStorage_Manager con llamadas a Firebase_Auth y Firestore
2. THE Planiverse SHALL eliminar la dependencia de LocalStorage_Manager para datos de usuario y módulos
3. THE Planiverse SHALL mantener la misma interfaz pública en Auth_Service para minimizar cambios en componentes
4. WHEN un componente necesita datos del usuario, THE Planiverse SHALL usar hooks de React que escuchen cambios en Firestore
5. THE Planiverse SHALL implementar un contexto de autenticación que provea el estado del usuario a toda la aplicación
6. THE Planiverse SHALL actualizar el componente Topbar para usar el estado de autenticación de Firebase

### Requirement 12: Mantener Compatibilidad Durante la Transición

**User Story:** Como usuario de Planiverse, quiero que la aplicación siga funcionando durante la migración, para que no experimente interrupciones en el servicio.

#### Acceptance Criteria

1. WHILE la migración está en progreso, THE Planiverse SHALL permitir operaciones de lectura desde localStorage como fallback
2. WHEN un dato no existe en Firestore pero existe en localStorage, THE Planiverse SHALL usar el dato de localStorage y marcarlo para migración
3. THE Planiverse SHALL priorizar datos de Firestore sobre localStorage cuando ambos existan
4. WHEN la migración se completa, THE Planiverse SHALL dejar de consultar localStorage para datos de usuario y módulos
5. THE Planiverse SHALL mantener localStorage como backup temporal durante 30 días después de la migración exitosa
6. THE Planiverse SHALL proporcionar una opción manual para limpiar datos de localStorage después de verificar la migración

### Requirement 13: Implementar Logging y Monitoreo

**User Story:** Como desarrollador de Planiverse, quiero tener logs detallados de las operaciones de Firebase, para poder diagnosticar problemas y monitorear el uso.

#### Acceptance Criteria

1. WHEN ocurre un error de Firebase_Auth, THE Planiverse SHALL registrar el error con contexto (operación, usuario, timestamp)
2. WHEN ocurre un error de Firestore, THE Planiverse SHALL registrar el error con contexto (colección, operación, usuario, timestamp)
3. WHEN se completa una migración, THE Planiverse SHALL registrar estadísticas (cantidad de documentos migrados, tiempo total, errores)
4. THE Planiverse SHALL registrar eventos importantes: login, logout, registro, actualización de perfil, migración
5. WHEN está en modo desarrollo, THE Planiverse SHALL mostrar logs detallados en la consola del navegador
6. WHEN está en modo producción, THE Planiverse SHALL enviar logs de errores a un servicio de monitoreo (preparado para integración futura)

### Requirement 14: Optimizar Rendimiento de Firestore

**User Story:** Como usuario de Planiverse, quiero que la aplicación cargue rápidamente, para que pueda acceder a mis datos sin demoras.

#### Acceptance Criteria

1. THE Planiverse SHALL usar índices compuestos en Firestore para consultas frecuentes (ordenamiento por fecha)
2. THE Planiverse SHALL implementar paginación para colecciones con más de 50 documentos
3. THE Planiverse SHALL usar caché de Firestore para reducir lecturas de red en datos que no cambian frecuentemente
4. WHEN un usuario carga un módulo, THE Planiverse SHALL cargar solo los datos visibles inicialmente y cargar más bajo demanda
5. THE Planiverse SHALL usar listeners de Firestore solo en vistas activas y desuscribirse cuando el componente se desmonte
6. THE Planiverse SHALL implementar debouncing para operaciones de escritura frecuentes (autoguardado de notas)

### Requirement 15: Documentar Estructura de Datos en Firestore

**User Story:** Como desarrollador de Planiverse, quiero tener documentación clara de la estructura de datos en Firestore, para que pueda mantener y extender la aplicación fácilmente.

#### Acceptance Criteria

1. THE Planiverse SHALL documentar el esquema de cada colección con tipos TypeScript
2. THE Planiverse SHALL documentar las reglas de validación para cada campo de documento
3. THE Planiverse SHALL documentar los índices requeridos en Firestore
4. THE Planiverse SHALL documentar las reglas de seguridad con ejemplos de uso
5. THE Planiverse SHALL documentar el proceso de migración con diagramas de flujo
6. THE Planiverse SHALL documentar patrones de acceso a datos y mejores prácticas para consultas
