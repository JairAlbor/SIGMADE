# Documentación de Script: modal.js

## Descripción
`modal.js` gestiona la interactividad del catálogo de materiales, permitiendo la búsqueda en tiempo real, la adición de nuevos elementos visuales y el control de ventanas modales con estética "Glassmorphism".

## Funcionalidades Principales

### 1. Control de Modales
- **Apertura**: Al hacer clic en el botón de agregar, limpia los campos y aplica la clase `active` al overlay del modal.
- **Cierre**: Permite cerrar el modal mediante interacción directa (botón cerrar) o haciendo clic en el área sombreada exterior (backdrop).

### 2. Búsqueda y Filtrado (Search)
- Implementa un escucha de eventos `input` en el campo de búsqueda.
- Filtra las filas de la tabla de catálogo de manera inmediata, comparando el término ingresado con todo el texto de la fila (case-insensitive).

### 3. Gestión de Datos en UI
- **`saveItem`**: Valida y extrae datos de los campos del modal para insertar dinámicamente una nueva fila en la tabla del catálogo, asignando clases de estilo personalizadas según la categoría (Libro/Deporte).
- **`deleteRow`**: Permite la eliminación lógica y visual de artículos con un cuadro de confirmación de seguridad.
- **`updateStats`**: Recalcula los totales de artículos y unidades disponibles mostrados en los indicadores superiores tras cada cambio en la tabla.

## Interfaz de Usuario
El script está diseñado para trabajar con selectores de clase CSS que implementan efectos visuales modernos y transiciones suaves para una experiencia de usuario premium.
