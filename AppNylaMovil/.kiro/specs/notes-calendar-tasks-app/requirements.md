# Documento de Requisitos

## Introducción

Planiverse (Planner Universal Modular) es un sistema de organización personal modular donde el usuario selecciona qué módulos desea utilizar. La aplicación comienza con un wizard de configuración inicial de 3 pasos que permite al usuario personalizar su experiencia seleccionando entre diferentes módulos: Tareas, Calendario, Rutinas, Notas y Recordatorios. La aplicación está construida con Next.js, TypeScript y Tailwind CSS, proporcionando una experiencia de usuario minimalista, moderna y completamente responsiva.

## Glosario

- **Sistema**: La aplicación completa Planiverse
- **Usuario**: Persona que utiliza la aplicación
- **Wizard**: Asistente de configuración inicial de 3 pasos
- **Módulo**: Funcionalidad independiente que el usuario puede activar o desactivar (Tareas, Calendario, Rutinas, Notas, Recordatorios)
- **Tarjeta_Módulo**: Componente visual clickeable que representa un módulo
- **Selección_Módulos**: Conjunto de módulos que el usuario ha elegido activar
- **Estado_Local**: Gestión de estado usando React useState hooks
- **Paso_Wizard**: Cada una de las 3 etapas del wizard (Bienvenida, Selección, Confirmación)

## Requisitos

### Requisito 1: Wizard de Configuración Inicial - Paso 1 (Bienvenida)

**Historia de Usuario:** Como usuario nuevo, quiero ver una pantalla de bienvenida, para entender qué es Planiverse y comenzar la configuración.

#### Criterios de Aceptación

1. WHEN el Usuario accede a la aplicación por primera vez, THE Sistema SHALL mostrar el Paso_Wizard de bienvenida
2. THE Sistema SHALL mostrar el título "Bienvenido a Planiverse"
3. THE Sistema SHALL mostrar el subtítulo "Construye tu sistema de organización modular"
4. THE Sistema SHALL mostrar un botón con el texto "Comenzar"
5. WHEN el Usuario presiona el botón "Comenzar", THE Sistema SHALL avanzar al Paso_Wizard 2
6. THE Sistema SHALL aplicar diseño minimalista con fondo claro
7. THE Sistema SHALL aplicar animaciones suaves usando Tailwind CSS

### Requisito 2: Wizard de Configuración Inicial - Paso 2 (Selección de Módulos)

**Historia de Usuario:** Como usuario, quiero seleccionar qué módulos deseo usar, para personalizar mi experiencia en Planiverse.

#### Criterios de Aceptación

1. WHEN el Usuario está en el Paso_Wizard 2, THE Sistema SHALL mostrar cinco Tarjeta_Módulo
2. THE Sistema SHALL mostrar una Tarjeta_Módulo para el módulo "Tareas"
3. THE Sistema SHALL mostrar una Tarjeta_Módulo para el módulo "Calendario"
4. THE Sistema SHALL mostrar una Tarjeta_Módulo para el módulo "Rutinas"
5. THE Sistema SHALL mostrar una Tarjeta_Módulo para el módulo "Notas"
6. THE Sistema SHALL mostrar una Tarjeta_Módulo para el módulo "Recordatorios"
7. THE Sistema SHALL hacer cada Tarjeta_Módulo clickeable
8. WHEN el Usuario hace click en una Tarjeta_Módulo, THE Sistema SHALL activar el módulo correspondiente
9. WHEN el Usuario hace click en una Tarjeta_Módulo activa, THE Sistema SHALL desactivar el módulo correspondiente
10. THE Sistema SHALL indicar visualmente el estado activo o inactivo de cada Tarjeta_Módulo
11. THE Sistema SHALL aplicar animaciones a las Tarjeta_Módulo al activar o desactivar
12. THE Sistema SHALL guardar la Selección_Módulos en Estado_Local usando useState
13. THE Sistema SHALL mostrar un botón "Siguiente"
14. WHEN el Usuario presiona el botón "Siguiente", THE Sistema SHALL avanzar al Paso_Wizard 3

### Requisito 3: Wizard de Configuración Inicial - Paso 3 (Confirmación)

**Historia de Usuario:** Como usuario, quiero confirmar mi selección de módulos, para finalizar la configuración inicial de Planiverse.

#### Criterios de Aceptación

1. WHEN el Usuario está en el Paso_Wizard 3, THE Sistema SHALL mostrar un botón grande con el texto "Crear mi Planiverse"
2. WHEN el Usuario presiona el botón "Crear mi Planiverse", THE Sistema SHALL guardar la Selección_Módulos en Estado_Local
3. WHEN el Usuario presiona el botón "Crear mi Planiverse", THE Sistema SHALL ejecutar console.log con la Selección_Módulos
4. THE Sistema SHALL aplicar diseño minimalista con fondo claro
5. THE Sistema SHALL aplicar animaciones suaves al botón usando Tailwind CSS

### Requisito 4: Indicador de Progreso del Wizard

**Historia de Usuario:** Como usuario, quiero ver en qué paso del wizard me encuentro, para saber cuánto falta para completar la configuración.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar un indicador visual del paso actual del Wizard
2. THE Sistema SHALL indicar que hay 3 pasos en total
3. WHEN el Usuario está en el Paso_Wizard 1, THE Sistema SHALL resaltar el paso 1 en el indicador
4. WHEN el Usuario está en el Paso_Wizard 2, THE Sistema SHALL resaltar el paso 2 en el indicador
5. WHEN el Usuario está en el Paso_Wizard 3, THE Sistema SHALL resaltar el paso 3 en el indicador
6. THE Sistema SHALL mostrar los pasos completados de forma visualmente diferenciada

### Requisito 5: Arquitectura de Componentes

**Historia de Usuario:** Como desarrollador, quiero una arquitectura de componentes clara y reutilizable, para mantener el código limpio y escalable.

#### Criterios de Aceptación

1. THE Sistema SHALL implementar un componente Wizard.tsx en la carpeta components
2. THE Sistema SHALL implementar un componente ModuleCard.tsx en la carpeta components
3. THE Sistema SHALL implementar un componente StepIndicator.tsx en la carpeta components
4. THE Sistema SHALL usar TypeScript para todos los componentes
5. THE Sistema SHALL usar React hooks para gestión de estado
6. THE Sistema SHALL aplicar la directiva "use client" donde sea necesario
7. THE Sistema SHALL hacer los componentes reutilizables
8. THE Sistema SHALL mantener separación de responsabilidades entre componentes

### Requisito 6: Diseño Responsivo

**Historia de Usuario:** Como usuario, quiero usar el wizard en cualquier dispositivo, para poder configurar Planiverse desde móvil, tablet o escritorio.

#### Criterios de Aceptación

1. THE Sistema SHALL adaptar el Wizard para pantallas de escritorio
2. THE Sistema SHALL adaptar el Wizard para pantallas de tablet
3. THE Sistema SHALL adaptar el Wizard para pantallas de móvil
4. WHEN el tamaño de pantalla cambia, THE Sistema SHALL reorganizar las Tarjeta_Módulo
5. THE Sistema SHALL mantener la funcionalidad completa en todos los tamaños de pantalla
6. THE Sistema SHALL usar clases responsivas de Tailwind CSS
7. THE Sistema SHALL mantener la legibilidad del texto en todos los dispositivos

### Requisito 7: Estética y Animaciones

**Historia de Usuario:** Como usuario, quiero una interfaz moderna y agradable, para disfrutar de una experiencia visual atractiva.

#### Criterios de Aceptación

1. THE Sistema SHALL aplicar diseño minimalista en todo el Wizard
2. THE Sistema SHALL usar fondo claro en todas las pantallas
3. THE Sistema SHALL aplicar estética moderna tipo SaaS
4. THE Sistema SHALL implementar transiciones suaves entre pasos del Wizard
5. THE Sistema SHALL aplicar animaciones suaves a las Tarjeta_Módulo usando Tailwind CSS
6. THE Sistema SHALL aplicar animaciones hover a elementos interactivos
7. THE Sistema SHALL mantener consistencia visual en todos los Paso_Wizard

### Requisito 8: Gestión de Estado

**Historia de Usuario:** Como usuario, quiero que el wizard recuerde mi selección mientras navego entre pasos, para no perder mi configuración.

#### Criterios de Aceptación

1. THE Sistema SHALL usar useState para gestionar el paso actual del Wizard
2. THE Sistema SHALL usar useState para gestionar la Selección_Módulos
3. WHEN el Usuario activa o desactiva un Módulo, THE Sistema SHALL actualizar el Estado_Local inmediatamente
4. WHEN el Usuario navega entre pasos, THE Sistema SHALL preservar la Selección_Módulos
5. THE Sistema SHALL mantener el estado de cada Módulo (activo o inactivo) durante toda la sesión del Wizard
