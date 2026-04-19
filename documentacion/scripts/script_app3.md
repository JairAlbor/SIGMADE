# Documentación de Script: app3.js

## Descripción
`app3.js` centraliza la gestión avanzada de usuarios desde el punto de vista administrativo. Maneja las consultas de estadísticas de red, la visualización de tablas de usuarios y las acciones de edición y eliminación de perfiles.

## Funciones Principales

### 1. Estadísticas de Usuarios (`contarTotalUsuarios`)
- Realiza una petición `GET` a `/api/usuario/num`.
- Actualiza dinámicamente varios contadores en la UI:
    - Total de usuarios registrados.
    - Usuarios con estatus "Activo".
    - Usuarios con estatus "Inactivo".
- Sincroniza estos valores tanto en el dashboard principal como dentro de los modales informativos.

### 2. Panel de Gestión de Usuarios (`consultarUsuarios`)
- Recupera el listado completo de usuarios mediante `/api/usuario`.
- **Renderizado Dinámico**: Construye una tabla con Badges de estatus (Active/Inactive) y botones de acción (Editar/Eliminar).
- Formatea fechas dinámicamente usando `toLocaleDateString()`.

### 3. Modales de Interacción (`toggleModal`)
- Implementa una función genérica para mostrar u ocultar modales mediante la manipulación de la clase `hidden`.
- Incluye lógica para cerrar modales al hacer clic fuera del contenedor (overlay).

### 4. Operaciones Administrativas
- **`eliminarUsuario`**: Gestiona la baja de usuarios con confirmación previa y refresco automático de la lista y contadores tras el éxito de la operación.
- **`probarRutaProtegida`**: Función de utilidad para verificar la validez del JWT contra el endpoint de prueba del servidor.
