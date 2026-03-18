# Plan de Implementación: Firebase Migration

## Overview

Este plan implementa la migración completa de Planiverse de localStorage a Firebase, incluyendo Firebase Authentication para autenticación de usuarios y Firestore para persistencia de datos. La implementación se realiza de forma incremental, comenzando con los servicios base, luego los hooks personalizados, seguido de la actualización de componentes existentes, y finalmente las reglas de seguridad y testing.

## Tasks

- [ ] 1. Configurar servicios base de Firebase
  - [x] 1.1 Crear AuthService para Firebase Authentication
    - Implementar métodos: register, login, loginWithGoogle, logout, getCurrentUser, onAuthStateChanged
    - Manejar errores de Firebase Auth (invalid-email, user-not-found, wrong-password, email-already-in-use, network-request-failed)
    - Retornar AuthResult con success, user, y error
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 1.2 Escribir property test para AuthService
    - **Property 1: User Registration Creates Account**
    - **Property 2: Valid Login Returns User Data**
    - **Property 3: Google OAuth Authentication**
    - **Property 4: Logout Clears Session**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
  
  - [x] 1.3 Crear FirestoreService genérico para operaciones CRUD
    - Implementar métodos: create, read, readAll, update, delete, subscribe
    - Usar rutas de colección por usuario: users/{userId}/{collection}/{docId}
    - Manejar errores de Firestore (permission-denied, unavailable, invalid-argument)
    - Implementar suscripciones en tiempo real con onSnapshot
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 1.4 Escribir property tests para FirestoreService
    - **Property 5: Document Creation in User Subcollection**
    - **Property 6: User Data Isolation**
    - **Property 7: Update Timestamp Invariant**
    - **Property 8: Document Deletion Removes Data**
    - **Property 9: Real-time Subscription Updates**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [x] 1.5 Crear MigrationService para migrar datos de localStorage
    - Implementar métodos: hasLocalStorageData, migrateUserData, migrateCollection, clearLocalStorage
    - Detectar datos en localStorage con prefijo planiverse_*
    - Migrar todas las colecciones: tasks, notes, calendar, routines, reminders
    - Convertir Date a Timestamp de Firebase
    - Manejar errores de migración parcial (continuar con colecciones válidas)
    - Solo limpiar localStorage si migración es 100% exitosa
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 1.6 Escribir property tests para MigrationService
    - **Property 10: localStorage Detection**
    - **Property 11: Migration Data Preservation (Round-trip)**
    - **Property 12: Successful Migration Cleanup**
    - **Property 13: Failed Migration Preservation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 2. Checkpoint - Verificar servicios base
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Crear hooks personalizados de Firebase
  - [x] 3.1 Crear hook useFirebaseAuth
    - Retornar: user, loading, error, register, login, loginWithGoogle, logout
    - Implementar estado reactivo con useState
    - Suscribirse a onAuthStateChanged en useEffect
    - Manejar loading durante operaciones async
    - Limpiar suscripción en cleanup
    - _Requirements: 4.1_
  
  - [ ]* 3.2 Escribir property test para useFirebaseAuth
    - **Property 14: useFirebaseAuth Reactive State**
    - **Validates: Requirements 4.1**
  
  - [x] 3.3 Crear hook useFirestore genérico
    - Retornar: data, loading, error, addItem, updateItem, deleteItem, refreshData
    - Implementar suscripción automática a colección en useEffect
    - Usar FirestoreService.subscribe para actualizaciones en tiempo real
    - Implementar métodos CRUD que llamen a FirestoreService
    - Limpiar suscripción en cleanup
    - _Requirements: 4.2_
  
  - [ ]* 3.4 Escribir property test para useFirestore
    - **Property 15: useFirestore Real-time Sync**
    - **Validates: Requirements 4.2**
  
  - [ ]* 3.5 Escribir unit tests para hooks
    - Test useFirebaseAuth: state updates, error handling, cleanup
    - Test useFirestore: CRUD operations, real-time updates, cleanup
    - _Requirements: 4.1, 4.2_

- [ ] 4. Checkpoint - Verificar hooks personalizados
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Actualizar componentes del wizard de onboarding
  - [x] 5.1 Actualizar AuthStep para usar Firebase
    - Reemplazar AuthService.login() por useFirebaseAuth().login()
    - Reemplazar OAuth callback por useFirebaseAuth().loginWithGoogle()
    - Eliminar manejo manual de localStorage
    - Mostrar errores de Firebase con mensajes user-friendly
    - Manejar loading state durante autenticación
    - _Requirements: 1.2, 1.3_
  
  - [x] 5.2 Actualizar RegisterStep para usar Firebase
    - Reemplazar AuthService.register() por useFirebaseAuth().register()
    - Eliminar manejo manual de localStorage
    - Validar email format antes de enviar
    - Mostrar errores específicos (email-already-in-use, invalid-email)
    - Manejar loading state durante registro
    - _Requirements: 1.1_
  
  - [x] 5.3 Actualizar UserDataStep para guardar en Firestore
    - Usar FirestoreService.update() para guardar perfil
    - Guardar en ruta: users/{userId}/profile
    - Incluir timestamps: createdAt, updatedAt
    - Iniciar migración automática si hay datos en localStorage
    - Mostrar progreso de migración al usuario
    - _Requirements: 2.1, 2.3, 3.1, 3.2_
  
  - [ ]* 5.4 Escribir unit tests para wizard components
    - Test AuthStep: login flow, OAuth flow, error handling
    - Test RegisterStep: registration flow, validation, errors
    - Test UserDataStep: profile save, migration trigger
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1_

- [ ] 6. Actualizar módulo de Tasks
  - [x] 6.1 Migrar Tasks a useFirestore
    - Reemplazar useState y localStorage por useFirestore<Task>('tasks')
    - Usar addItem, updateItem, deleteItem del hook
    - Eliminar useEffect para cargar de localStorage
    - Aprovechar actualizaciones en tiempo real automáticas
    - Manejar loading y error states del hook
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 6.2 Escribir unit tests para Tasks module
    - Test CRUD operations
    - Test real-time updates
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Actualizar módulo de Notes
  - [x] 7.1 Migrar Notes a useFirestore
    - Reemplazar useState y localStorage por useFirestore<Note>('notes')
    - Usar addItem, updateItem, deleteItem del hook
    - Eliminar useEffect para cargar de localStorage
    - Aprovechar actualizaciones en tiempo real automáticas
    - Manejar loading y error states del hook
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 7.2 Escribir unit tests para Notes module
    - Test CRUD operations
    - Test real-time updates
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Actualizar módulo de Calendar
  - [x] 8.1 Migrar Calendar a useFirestore
    - Reemplazar useState y localStorage por useFirestore<CalendarEvent>('calendar')
    - Convertir Date a Timestamp de Firebase para startDate y endDate
    - Usar addItem, updateItem, deleteItem del hook
    - Eliminar useEffect para cargar de localStorage
    - Aprovechar actualizaciones en tiempo real automáticas
    - Manejar loading y error states del hook
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 8.2 Escribir unit tests para Calendar module
    - Test CRUD operations con conversión de fechas
    - Test real-time updates
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 9. Actualizar módulo de Routines
  - [x] 9.1 Migrar Routines a useFirestore
    - Reemplazar useState y localStorage por useFirestore<Routine>('routines')
    - Usar addItem, updateItem, deleteItem del hook
    - Eliminar useEffect para cargar de localStorage
    - Aprovechar actualizaciones en tiempo real automáticas
    - Manejar loading y error states del hook
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 9.2 Escribir unit tests para Routines module
    - Test CRUD operations
    - Test real-time updates
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 10. Actualizar módulo de Reminders
  - [x] 10.1 Migrar Reminders a useFirestore
    - Reemplazar useState y localStorage por useFirestore<Reminder>('reminders')
    - Convertir Date a Timestamp de Firebase para reminderDate
    - Usar addItem, updateItem, deleteItem del hook
    - Eliminar useEffect para cargar de localStorage
    - Aprovechar actualizaciones en tiempo real automáticas
    - Manejar loading y error states del hook
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 10.2 Escribir unit tests para Reminders module
    - Test CRUD operations con conversión de fechas
    - Test real-time updates
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 11. Checkpoint - Verificar migración de módulos
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Actualizar página de Profile
  - [x] 12.1 Migrar Profile a Firebase
    - Usar useFirebaseAuth para obtener usuario actual
    - Cargar perfil desde Firestore: users/{userId}/profile
    - Actualizar perfil con FirestoreService.update()
    - Mostrar información de autenticación (método, email)
    - Eliminar dependencia de localStorage
    - Manejar loading y error states
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 12.2 Escribir unit tests para Profile page
    - Test carga de perfil
    - Test actualización de perfil
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 13. Implementar fallback offline con localStorage
  - [ ] 13.1 Añadir manejo de errores de red en FirestoreService
    - Detectar error 'unavailable' de Firestore
    - Guardar operaciones pendientes en localStorage con prefijo pending_
    - Retornar { success: true, offline: true } para operaciones offline
    - _Requirements: 6.1_
  
  - [ ] 13.2 Implementar sincronización al recuperar conexión
    - Detectar cuando Firestore vuelve a estar disponible
    - Leer operaciones pendientes de localStorage (pending_*)
    - Aplicar operaciones a Firestore en orden
    - Limpiar operaciones pendientes después de sincronizar
    - _Requirements: 6.2_
  
  - [ ] 13.3 Añadir indicador visual de estado offline
    - Crear componente OfflineIndicator
    - Mostrar banner cuando app está en modo offline
    - Actualizar cuando se recupera conexión
    - _Requirements: 6.1_
  
  - [ ]* 13.4 Escribir property tests para offline/sync
    - **Property 18: localStorage Fallback on Network Error**
    - **Property 19: Sync on Network Restoration**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 14. Configurar Firestore Security Rules
  - [x] 14.1 Crear archivo firestore.rules
    - Implementar helper functions: isAuthenticated(), isOwner(userId)
    - Regla para users/{userId}: solo lectura/escritura por owner
    - Regla para profile: solo lectura/escritura por owner
    - Regla para subcolecciones: solo lectura/escritura por owner
    - Validar timestamps en create (createdAt, updatedAt requeridos)
    - Validar timestamps en update (updatedAt requerido)
    - _Requirements: 5.1, 5.2_
  
  - [x] 14.2 Desplegar reglas a Firebase
    - Ejecutar: firebase deploy --only firestore:rules
    - Verificar reglas en Firebase Console
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 14.3 Escribir property test para security rules
    - **Property 16: Firestore Rules Enforce User Isolation**
    - **Property 17: Timestamp Validation on Create**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 15. Configurar Firebase Emulator para testing
  - [ ] 15.1 Instalar y configurar Firebase Emulator Suite
    - Instalar firebase-tools: npm install -g firebase-tools
    - Ejecutar: firebase init emulators
    - Configurar Auth emulator en puerto 9099
    - Configurar Firestore emulator en puerto 8080
    - Configurar UI emulator en puerto 4000
    - _Requirements: Testing infrastructure_
  
  - [ ] 15.2 Conectar tests a emulators
    - Crear archivo de configuración de test
    - Usar connectAuthEmulator y connectFirestoreEmulator en tests
    - Configurar variable de entorno NODE_ENV=test
    - _Requirements: Testing infrastructure_
  
  - [ ]* 15.3 Configurar fast-check para property-based testing
    - Instalar: npm install --save-dev fast-check @types/fast-check
    - Configurar mínimo 100 iteraciones por property test
    - Crear generators personalizados para Task, Note, CalendarEvent, etc.
    - _Requirements: Testing infrastructure_

- [ ] 16. Checkpoint final - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integración y wiring final
  - [ ] 17.1 Verificar flujo completo de autenticación
    - Test registro → login → dashboard
    - Test OAuth → dashboard
    - Test logout → redirect a login
    - Test persistencia de sesión en refresh
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 17.2 Verificar flujo completo de migración
    - Test detección de localStorage en primer login
    - Test migración de todas las colecciones
    - Test limpieza de localStorage después de migración
    - Test manejo de errores de migración
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 17.3 Verificar sincronización en tiempo real
    - Test actualizaciones automáticas en todos los módulos
    - Test sincronización entre múltiples tabs
    - Test manejo de conflictos
    - _Requirements: 2.5_
  
  - [ ]* 17.4 Escribir integration tests end-to-end
    - Test flujo completo: registro → onboarding → dashboard → CRUD
    - Test flujo de migración completo
    - Test flujo offline → online
    - _Requirements: All requirements_

- [ ] 18. Checkpoint final - Asegurar que todos los tests pasen
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades universales de correctness
- Los unit tests validan ejemplos específicos y casos edge
- Usar Firebase Emulator Suite para todos los tests (no usar Firebase production)
- El lenguaje de implementación es TypeScript (Next.js/React)
