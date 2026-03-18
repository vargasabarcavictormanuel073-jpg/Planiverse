# Documento de Requisitos: Sistema de Autenticación y Perfiles de Usuario

## Introducción

Este documento define los requisitos para el sistema de autenticación y perfiles de usuario de Planiverse. El sistema expandirá el wizard actual de 3 pasos a 5 pasos, incorporando autenticación con Gmail y email/password, recopilación de datos del usuario, selección de rol con entornos visuales diferenciados, y la selección de módulos existente. La implementación será frontend-only utilizando localStorage para persistencia de datos.

## Glosario

- **Auth_System**: Sistema de autenticación que gestiona el inicio de sesión y registro de usuarios
- **User_Profile**: Perfil de usuario que contiene información personal y preferencias
- **Wizard**: Flujo de configuración inicial de múltiples pasos
- **OAuth_Provider**: Proveedor de autenticación OAuth (Gmail)
- **Role**: Rol del usuario que determina el entorno visual (Estudiante, Maestro, Otro)
- **Theme**: Esquema de colores asociado a cada rol
- **LocalStorage_Manager**: Componente que gestiona la persistencia de datos en localStorage
- **Session**: Sesión activa del usuario autenticado

## Requisitos

### Requisito 1: Autenticación con Gmail (OAuth)

**User Story:** Como usuario, quiero iniciar sesión con mi cuenta de Gmail, para acceder rápidamente sin crear una contraseña nueva.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Iniciar sesión con Gmail", THE Auth_System SHALL iniciar el flujo de OAuth con Google
2. WHEN el flujo de OAuth se completa exitosamente, THE Auth_System SHALL almacenar los datos del usuario en localStorage
3. IF el usuario ya tiene una cuenta registrada, THEN THE Auth_System SHALL cargar su perfil existente y saltar al dashboard
4. IF el usuario es nuevo, THEN THE Wizard SHALL continuar al paso 3 (Datos del usuario)
5. WHEN el flujo de OAuth falla, THE Auth_System SHALL mostrar un mensaje de error descriptivo

### Requisito 2: Autenticación con Email y Contraseña

**User Story:** Como usuario, quiero crear una cuenta con email y contraseña, para tener control total sobre mis credenciales.

#### Acceptance Criteria

1. WHEN el usuario selecciona "Iniciar sesión con email", THE Auth_System SHALL mostrar un formulario con campos de email y contraseña
2. THE Auth_System SHALL validar que el email tenga formato válido antes de procesar
3. WHEN el usuario intenta iniciar sesión con credenciales existentes, THE Auth_System SHALL verificar las credenciales contra localStorage
4. IF las credenciales son correctas, THEN THE Auth_System SHALL crear una sesión y cargar el perfil del usuario
5. IF las credenciales son incorrectas, THEN THE Auth_System SHALL mostrar un mensaje de error sin revelar si el email existe
6. WHEN el usuario hace clic en "Crear cuenta nueva", THE Wizard SHALL mostrar el paso 2 (Crear cuenta)

### Requisito 3: Registro de Nueva Cuenta

**User Story:** Como usuario nuevo, quiero registrarme con email y contraseña, para crear mi cuenta en Planiverse.

#### Acceptance Criteria

1. WHEN el usuario está en el paso de registro, THE Auth_System SHALL mostrar campos para email, contraseña y confirmación de contraseña
2. THE Auth_System SHALL validar que la contraseña tenga al menos 8 caracteres
3. THE Auth_System SHALL validar que la contraseña y su confirmación coincidan
4. THE Auth_System SHALL validar que el email no esté ya registrado en localStorage
5. WHEN el registro es exitoso, THE Auth_System SHALL almacenar las credenciales hasheadas en localStorage
6. WHEN el registro es exitoso, THE Wizard SHALL continuar al paso 3 (Datos del usuario)
7. IF el email ya está registrado, THEN THE Auth_System SHALL mostrar un mensaje indicando que la cuenta ya existe

### Requisito 4: Recopilación de Datos del Usuario

**User Story:** Como usuario, quiero proporcionar mi información personal, para personalizar mi experiencia en Planiverse.

#### Acceptance Criteria

1. WHEN el usuario llega al paso 3, THE Wizard SHALL mostrar campos para nombre completo, apodo y edad
2. THE User_Profile SHALL validar que el nombre completo no esté vacío
3. THE User_Profile SHALL validar que el apodo tenga entre 2 y 20 caracteres
4. THE User_Profile SHALL validar que la edad sea un número entre 5 y 120
5. WHEN el usuario completa el formulario, THE Wizard SHALL almacenar los datos en el perfil del usuario
6. WHEN el usuario hace clic en "Siguiente", THE Wizard SHALL avanzar al paso 4 (Selección de rol)

### Requisito 5: Selección de Rol

**User Story:** Como usuario, quiero seleccionar mi rol (Estudiante, Maestro u Otro), para tener un entorno visual adaptado a mis necesidades.

#### Acceptance Criteria

1. WHEN el usuario llega al paso 4, THE Wizard SHALL mostrar tres opciones de rol: Estudiante, Maestro y Otro
2. THE Wizard SHALL mostrar una vista previa del esquema de colores para cada rol
3. WHEN el usuario selecciona un rol, THE User_Profile SHALL almacenar la selección
4. WHEN el usuario hace clic en "Siguiente", THE Wizard SHALL avanzar al paso 5 (Selección de módulos)
5. THE User_Profile SHALL asociar el rol seleccionado con su Theme correspondiente

### Requisito 6: Esquemas de Color por Rol

**User Story:** Como usuario, quiero que la interfaz refleje mi rol seleccionado, para tener una experiencia visual coherente.

#### Acceptance Criteria

1. WHERE el rol es Estudiante, THE Theme SHALL aplicar un esquema de colores con tonos azules y verdes
2. WHERE el rol es Maestro, THE Theme SHALL aplicar un esquema de colores con tonos naranjas y rojos
3. WHERE el rol es Otro, THE Theme SHALL aplicar un esquema de colores con tonos morados y grises
4. THE Theme SHALL aplicarse a todos los componentes del Wizard después de la selección de rol
5. THE Theme SHALL persistir en localStorage junto con el perfil del usuario
6. WHEN el usuario inicia sesión, THE Theme SHALL cargarse automáticamente según el rol guardado

### Requisito 7: Integración con Selección de Módulos Existente

**User Story:** Como usuario, quiero seleccionar los módulos que necesito después de configurar mi perfil, para completar la configuración inicial.

#### Acceptance Criteria

1. WHEN el usuario llega al paso 5, THE Wizard SHALL mostrar la interfaz de selección de módulos existente
2. THE Wizard SHALL aplicar el Theme del rol seleccionado a las tarjetas de módulos
3. WHEN el usuario selecciona módulos, THE User_Profile SHALL almacenar las selecciones
4. WHEN el usuario hace clic en "Crear mi Planiverse", THE Wizard SHALL guardar toda la configuración en localStorage
5. THE Wizard SHALL redirigir al usuario al dashboard con su configuración completa

### Requisito 8: Persistencia de Sesión

**User Story:** Como usuario, quiero que mi sesión persista entre visitas, para no tener que iniciar sesión cada vez.

#### Acceptance Criteria

1. WHEN el usuario completa el wizard, THE LocalStorage_Manager SHALL almacenar un token de sesión
2. WHEN el usuario regresa a la aplicación, THE Auth_System SHALL verificar si existe una sesión activa
3. IF existe una sesión válida, THEN THE Auth_System SHALL cargar el perfil del usuario y redirigir al dashboard
4. IF no existe sesión o está expirada, THEN THE Auth_System SHALL mostrar el paso 1 del wizard
5. THE Session SHALL incluir timestamp de creación para validación de expiración

### Requisito 9: Cierre de Sesión

**User Story:** Como usuario, quiero poder cerrar sesión, para proteger mi privacidad en dispositivos compartidos.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Cerrar sesión", THE Auth_System SHALL eliminar el token de sesión de localStorage
2. THE Auth_System SHALL limpiar todos los datos de sesión en memoria
3. THE Auth_System SHALL redirigir al usuario al paso 1 del wizard
4. THE Auth_System SHALL mantener el perfil del usuario en localStorage para futuros inicios de sesión

### Requisito 10: Validación de Formularios

**User Story:** Como usuario, quiero recibir retroalimentación inmediata sobre errores en formularios, para corregirlos rápidamente.

#### Acceptance Criteria

1. WHEN el usuario ingresa datos inválidos, THE Wizard SHALL mostrar mensajes de error específicos junto al campo correspondiente
2. THE Wizard SHALL deshabilitar el botón "Siguiente" mientras existan errores de validación
3. THE Wizard SHALL mostrar indicadores visuales (color rojo) en campos con errores
4. WHEN el usuario corrige un error, THE Wizard SHALL remover el mensaje de error inmediatamente
5. THE Wizard SHALL validar en tiempo real mientras el usuario escribe

### Requisito 11: Navegación entre Pasos del Wizard

**User Story:** Como usuario, quiero poder navegar entre los pasos del wizard, para revisar o modificar información anterior.

#### Acceptance Criteria

1. WHEN el usuario está en los pasos 2-5, THE Wizard SHALL mostrar un botón "Atrás"
2. WHEN el usuario hace clic en "Atrás", THE Wizard SHALL retroceder al paso anterior sin perder datos
3. THE Wizard SHALL preservar los datos ingresados al navegar entre pasos
4. THE Wizard SHALL actualizar el indicador de progreso al cambiar de paso
5. THE Wizard SHALL prevenir navegación hacia adelante si el paso actual no está completo

### Requisito 12: Indicador de Progreso del Wizard

**User Story:** Como usuario, quiero ver mi progreso en el wizard, para saber cuántos pasos me faltan.

#### Acceptance Criteria

1. THE Wizard SHALL mostrar un indicador visual con 5 pasos en la parte superior
2. THE Wizard SHALL resaltar el paso actual en el indicador
3. THE Wizard SHALL marcar los pasos completados con un ícono de verificación
4. THE Wizard SHALL mostrar los pasos futuros en estado inactivo
5. WHEN el usuario cambia de paso, THE Wizard SHALL actualizar el indicador con animación suave

### Requisito 13: Manejo de Errores de localStorage

**User Story:** Como usuario, quiero que la aplicación maneje correctamente errores de almacenamiento, para no perder mi progreso inesperadamente.

#### Acceptance Criteria

1. WHEN localStorage no está disponible, THE LocalStorage_Manager SHALL detectar la condición
2. IF localStorage está lleno, THEN THE LocalStorage_Manager SHALL mostrar un mensaje al usuario
3. THE LocalStorage_Manager SHALL intentar guardar datos críticos con manejo de errores
4. IF falla el guardado, THEN THE LocalStorage_Manager SHALL notificar al usuario y sugerir acciones
5. THE LocalStorage_Manager SHALL validar que los datos se guardaron correctamente después de cada escritura

### Requisito 14: Accesibilidad del Wizard

**User Story:** Como usuario con necesidades de accesibilidad, quiero que el wizard sea completamente navegable con teclado y lector de pantalla, para poder completar la configuración.

#### Acceptance Criteria

1. THE Wizard SHALL permitir navegación completa usando solo el teclado
2. THE Wizard SHALL incluir atributos ARIA apropiados en todos los elementos interactivos
3. THE Wizard SHALL anunciar cambios de paso a lectores de pantalla
4. THE Wizard SHALL mantener el foco visible en todo momento
5. THE Wizard SHALL cumplir con contraste de color mínimo WCAG AA para todos los temas
6. WHEN ocurre un error de validación, THE Wizard SHALL anunciar el error a lectores de pantalla

### Requisito 15: Responsividad del Wizard

**User Story:** Como usuario móvil, quiero que el wizard funcione correctamente en mi dispositivo, para completar la configuración desde cualquier lugar.

#### Acceptance Criteria

1. THE Wizard SHALL adaptarse a pantallas desde 320px de ancho
2. THE Wizard SHALL mantener legibilidad en todos los tamaños de pantalla
3. THE Wizard SHALL ajustar el tamaño de botones para touch en dispositivos móviles
4. THE Wizard SHALL reorganizar el layout en pantallas pequeñas sin scroll horizontal
5. THE Wizard SHALL mantener funcionalidad completa en todos los tamaños de pantalla
