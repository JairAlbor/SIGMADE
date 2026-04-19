# Documentación de Script: profile.js

## Descripción
`profile.js` gestiona la visualización de la información personal del usuario y la lógica de cierre de sesión. Se encarga de personalizar la interfaz tras una autenticación exitosa.

## Funciones Principales

### 1. Inicialización de Perfil (`DOMContentLoaded`)
- Recupera el objeto `usuarioInfo` del `localStorage`.
- Deserializa el JSON para obtener objetos manipulables.
- Inyecta dinámicamente los datos del usuario en los elementos del DOM:
    - Nombre y Apellidos (en el encabezado y en el cuerpo del perfil).
    - Email, Teléfono, Rol y Estatus.
    - Fecha de creación de la cuenta (formateada mediante `toLocaleDateString`).

### 2. Cierre de Sesión (`logout`)
- Realiza una limpieza profunda del `localStorage`:
    - Elimina `userToken` (invalidando futuras peticiones a la API).
    - Elimina `usuarioInfo`.
- Redirige al usuario a `index.html` (pantalla de login).

## Seguridad
Al eliminar el token del almacenamiento local, el script asegura que ninguna sesión quede abierta accidentalmente en el navegador tras el cierre manual de la sesión.
