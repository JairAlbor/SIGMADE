# Documentación de Script: app.js

## Descripción
`app.js` es el controlador principal del frontend para la gestión de materiales y la autenticación de usuarios. Maneja la lógica de inicio de sesión, registro de nuevos materiales y la visualización dinámica del inventario en la interfaz de usuario.

## Funciones Principales

### 1. Autenticación (`loginUsuario`)
- Captura las credenciales (Email/ID y Password).
- Realiza una petición `POST` a `/api/login`.
- Si es exitosa, almacena el `userToken` y la información del usuario en el `localStorage`.
- Redirige al usuario según su rol (`Admin` o `User`).

### 2. Gestión de Materiales
- **`cargarArticulos`**: Consulta la API para obtener la lista de materiales y construye dinámicamente las filas de la tabla en `Dashboard.html` o `catalogo.html`. Implementa badges de color según la disciplina.
- **`guardarArticulo`**: Envía los datos de un nuevo artículo al servidor incluyendo el token JWT en el encabezado.
- **`editarMaterial` / `eliminarMaterial`**: Implementa la lógica de actualización y borrado mediante peticiones `PUT` y `DELETE` respectivamente.

### 3. Estadísticas Dinámicas
- **`contarTotalMateriales`**: Actualiza el contador de artículos totales en el Dashboard.
- **`contarDisponibles`**: Filtra y cuenta los artículos con estatus "Libre" para mostrar la disponibilidad inmediata.

## Seguridad
Todas las funciones que interactúan con la API (`fetch`) recuperan el token guardado mediante `localStorage.getItem('userToken')` y lo envían en el header `Authorization`.
