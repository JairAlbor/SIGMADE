# Documentación de Script: modal-eventos.js

## Descripción
Script avanzado para la gestión de calendarios, eventos deportivos y disciplinas. Maneja estructuras de datos temporales (en memoria) para prototipado rápido y gestión de UI.

## Funciones Principales
### 1. Gestión de Eventos
- **Renderizado (`renderEvents`)**: Genera tarjetas de eventos dinámicas con detalles de fecha, lugar y asistentes, usando inyección de plantillas HTML.
- **Eliminación (`deleteEvent`)**: Filtra el array de eventos y refresca la vista inmediatamente tras confirmación del usuario.
### 2. Gestión de Disciplinas
- **`openDisciplines`**: Muestra modales de disciplinas con información sobre entrenadores y número de miembros asociados a cada área deportiva.

---

# Documentación de Script: verificarSesion.js

## Descripción
Middleware crítico de frontend que implementa la protección de rutas en el lado del cliente (Route Guards). Asegura que el acceso a la aplicación esté restringido a usuarios autenticados.

## Funciones Principales
### 1. Verificación de Token
- Al cargarse el script (generalmente al inicio de cada página protegida), comprueba la existencia del `userToken` en el `localStorage`.
- **Redirección Forzada**: Si el token no está presente (indicando que no hay sesión activa), redirige inmediatamente al usuario a `index.html`.
- Este mecanismo protege la integridad visual de páginas como el Dashboard ante accesos directos por URL sin loguearse.
