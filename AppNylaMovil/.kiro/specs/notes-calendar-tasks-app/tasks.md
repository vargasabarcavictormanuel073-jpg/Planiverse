# Plan de Implementación: Planiverse - Wizard de Configuración

## Visión General

Implementación del wizard de configuración inicial de 3 pasos para Planiverse, una aplicación de organización personal modular. El wizard permite a los usuarios seleccionar qué módulos desean activar (Tareas, Calendario, Rutinas, Notas, Recordatorios) mediante una interfaz responsiva y moderna construida con Next.js, TypeScript y Tailwind CSS.

## Tareas

- [x] 1. Configurar estructura base y tipos de datos
  - Crear carpeta `components` en la raíz del proyecto
  - Definir tipos TypeScript para módulos y estado del wizard
  - Crear constante `AVAILABLE_MODULES` con los 5 módulos disponibles
  - _Requisitos: 5.1, 5.4_

- [x] 2. Implementar componente StepIndicator
  - [x] 2.1 Crear componente StepIndicator.tsx con props tipadas
    - Implementar interfaz `StepIndicatorProps` con currentStep y totalSteps
    - Renderizar indicador visual de 3 pasos con estado actual
    - Aplicar estilos Tailwind para diseño minimalista
    - Marcar pasos completados visualmente diferenciados
    - Implementar diseño responsivo (móvil, tablet, desktop)
    - Agregar ARIA labels para accesibilidad
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.3, 6.1, 6.2, 6.3_

  - [ ]* 2.2 Escribir test de propiedad para StepIndicator
    - **Propiedad 5: Indicador de Progreso Refleja Paso Actual**
    - **Valida: Requisitos 4.1, 4.3, 4.4, 4.5, 4.6**

- [x] 3. Implementar componente ModuleCard
  - [x] 3.1 Crear componente ModuleCard.tsx con props tipadas
    - Implementar interfaz `ModuleCardProps` con module, isSelected y onToggle
    - Renderizar tarjeta clickeable con icono, nombre y descripción
    - Aplicar estado visual diferenciado (activo/inactivo)
    - Implementar animaciones de hover y transición con Tailwind
    - Agregar atributos ARIA (role="checkbox", aria-checked)
    - Implementar navegación por teclado y focus visible
    - _Requisitos: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10, 2.11, 5.2, 7.5, 7.6_

  - [ ]* 3.2 Escribir tests unitarios para ModuleCard
    - Test de renderizado con diferentes estados (activo/inactivo)
    - Test de callback onToggle al hacer click
    - Test de accesibilidad (ARIA labels, navegación por teclado)
    - _Requisitos: 2.7, 2.10_

  - [ ]* 3.3 Escribir test de propiedad para toggle de módulos
    - **Propiedad 2: Toggle de Módulos**
    - **Valida: Requisitos 2.8, 2.9**

- [x] 4. Implementar componente Wizard - Estructura base
  - [x] 4.1 Crear componente Wizard.tsx con directiva "use client"
    - Definir interfaz `WizardState` con currentStep y selectedModules
    - Inicializar estado con useState: currentStep = 1, selectedModules = Set vacío
    - Implementar estructura condicional para renderizar paso actual
    - Renderizar componente StepIndicator en todos los pasos
    - _Requisitos: 5.1, 5.4, 5.5, 5.6, 8.1, 8.2_

  - [x] 4.2 Implementar función handleModuleToggle
    - Crear función que recibe ModuleType como parámetro
    - Actualizar selectedModules: agregar si no existe, eliminar si existe
    - Usar Set.has(), Set.add() y Set.delete() para operaciones
    - Memoizar con useCallback para optimización
    - _Requisitos: 2.8, 2.9, 2.12, 8.3_

  - [x] 4.3 Implementar función handleNextStep
    - Crear función que incrementa currentStep
    - Validar que currentStep no exceda 3
    - Preservar selectedModules al cambiar de paso
    - _Requisitos: 1.5, 2.14, 8.4_

  - [x] 4.4 Implementar función handleFinish
    - Crear función que se ejecuta al completar el wizard
    - Convertir Set a Array para console.log
    - Ejecutar console.log con la selección de módulos
    - _Requisitos: 3.2, 3.3_

  - [ ]* 4.5 Escribir test de propiedad para persistencia de estado
    - **Propiedad 4: Persistencia de Estado Durante Navegación**
    - **Valida: Requisitos 8.4, 8.5**

  - [ ]* 4.6 Escribir test de propiedad para sincronización estado-UI
    - **Propiedad 3: Sincronización Estado-UI**
    - **Valida: Requisitos 2.10, 2.12, 8.3**

- [x] 5. Implementar Paso 1: Bienvenida
  - [x] 5.1 Crear contenido del paso de bienvenida en Wizard.tsx
    - Renderizar título "Bienvenido a Planiverse"
    - Renderizar subtítulo "Construye tu sistema de organización modular"
    - Crear botón "Comenzar" que llama a handleNextStep
    - Aplicar diseño minimalista con fondo claro
    - Aplicar animaciones suaves con Tailwind
    - Implementar diseño responsivo
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 5.2 Escribir tests unitarios para Paso 1
    - Test de renderizado inicial en paso 1
    - Test de contenido correcto (título, subtítulo, botón)
    - Test de navegación al presionar "Comenzar"
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Implementar Paso 2: Selección de Módulos
  - [x] 6.1 Crear contenido del paso de selección en Wizard.tsx
    - Renderizar grid de 5 componentes ModuleCard
    - Pasar props correctas a cada ModuleCard (module, isSelected, onToggle)
    - Verificar estado isSelected usando selectedModules.has()
    - Pasar handleModuleToggle como callback onToggle
    - Aplicar grid responsivo (1 columna móvil, 2 tablet, 3 desktop)
    - Crear botón "Siguiente" que llama a handleNextStep
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.13, 2.14, 6.4, 6.5_

  - [ ]* 6.2 Escribir tests unitarios para Paso 2
    - Test de renderizado de 5 tarjetas con nombres correctos
    - Test de toggle de módulos actualiza estado
    - Test de navegación al presionar "Siguiente"
    - Test de edge case: toggle rápido del mismo módulo
    - _Requisitos: 2.1, 2.8, 2.9, 2.14_

  - [ ]* 6.3 Escribir test de propiedad para navegación secuencial
    - **Propiedad 1: Navegación Secuencial del Wizard**
    - **Valida: Requisitos 1.5, 2.14**

- [x] 7. Implementar Paso 3: Confirmación
  - [x] 7.1 Crear contenido del paso de confirmación en Wizard.tsx
    - Renderizar botón grande "Crear mi Planiverse"
    - Conectar botón con handleFinish
    - Aplicar diseño minimalista con fondo claro
    - Aplicar animaciones suaves al botón con Tailwind
    - Implementar diseño responsivo
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3_

  - [ ]* 7.2 Escribir tests unitarios para Paso 3
    - Test de renderizado del botón "Crear mi Planiverse"
    - Test de finalización guarda y muestra selección en console
    - Test de edge case: finalizar sin módulos seleccionados
    - Test de edge case: finalizar con todos los módulos seleccionados
    - _Requisitos: 3.1, 3.2, 3.3_

  - [ ]* 7.3 Escribir test de propiedad para finalización
    - **Propiedad 6: Finalización Guarda Selección**
    - **Valida: Requisitos 3.2, 3.3**

- [x] 8. Integrar Wizard en la página principal
  - [x] 8.1 Actualizar app/page.tsx para usar componente Wizard
    - Importar componente Wizard
    - Renderizar Wizard como componente principal
    - Mantener layout limpio y centrado
    - _Requisitos: 5.1_

  - [ ]* 8.2 Escribir test de integración end-to-end
    - Test de flujo completo: paso 1 → paso 2 → selección → paso 3 → finalización
    - Verificar que selectedModules se preserva durante todo el flujo
    - _Requisitos: 1.5, 2.14, 3.2, 8.4, 8.5_

- [x] 9. Checkpoint - Verificar funcionalidad core
  - Asegurar que todos los tests pasen
  - Verificar navegación entre pasos funciona correctamente
  - Verificar toggle de módulos funciona correctamente
  - Verificar console.log muestra selección al finalizar
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 10. Implementar diseño responsivo y animaciones
  - [x] 10.1 Refinar estilos responsivos con Tailwind
    - Aplicar breakpoints sm, md, lg para todos los componentes
    - Ajustar grid de ModuleCard para diferentes pantallas
    - Ajustar tamaño de botones y espaciado
    - Verificar legibilidad en todos los dispositivos
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 10.2 Implementar animaciones y transiciones
    - Agregar transiciones suaves entre pasos del wizard
    - Aplicar animaciones hover a elementos interactivos
    - Aplicar transiciones a cambios de estado de ModuleCard
    - Usar clases Tailwind (transition-all, duration-200, hover:scale-105)
    - _Requisitos: 1.7, 2.11, 3.5, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 10.3 Escribir test de propiedad para responsividad
    - **Propiedad 7: Responsividad Mantiene Funcionalidad**
    - **Valida: Requisitos 6.4, 6.5**

- [x] 11. Implementar accesibilidad completa
  - [x] 11.1 Agregar atributos ARIA y navegación por teclado
    - Verificar ARIA labels en todos los componentes interactivos
    - Implementar focus management correcto
    - Verificar navegación por teclado (Tab, Enter, Space)
    - Agregar indicadores visuales de focus
    - _Requisitos: 5.6, 6.5_

  - [ ]* 11.2 Escribir tests de accesibilidad
    - Test de navegación por teclado en todos los pasos
    - Test de ARIA labels presentes y correctos
    - Test de focus management
    - _Requisitos: 5.6_

- [x] 12. Optimización y manejo de errores
  - [x] 12.1 Implementar manejo de errores defensivo
    - Validar currentStep está en rango 1-3
    - Validar módulos existen en AVAILABLE_MODULES antes de toggle
    - Prevenir navegación más allá del paso 3
    - Agregar console.error/warn para debugging
    - _Requisitos: 8.1, 8.2_

  - [x] 12.2 Optimizar performance con memoización
    - Verificar useCallback en handleModuleToggle
    - Considerar React.memo para ModuleCard si es necesario
    - Verificar que no hay re-renders innecesarios
    - _Requisitos: 5.5, 8.3_

- [x] 13. Checkpoint final - Verificación completa
  - Ejecutar todos los tests (unitarios y de propiedades)
  - Verificar diseño responsivo en móvil, tablet y desktop
  - Verificar accesibilidad con navegación por teclado
  - Verificar animaciones funcionan suavemente
  - Verificar console.log muestra selección correcta
  - Preguntar al usuario si hay ajustes finales necesarios

## Notas

- Las tareas marcadas con `*` son opcionales (principalmente tests) y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de corrección
- Los tests unitarios validan casos específicos y edge cases
- El lenguaje de implementación es TypeScript con React y Next.js
