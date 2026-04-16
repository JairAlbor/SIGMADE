# Documentación de Script: backend/server.js

## Descripción
Este es el motor principal del backend de SIGMADE. Utiliza Node.js con Express para gestionar la lógica del servidor, las rutas de la API, la autenticación JWT y la conexión con la base de datos.

## Dependencias
- `express`: Framework para el servidor web.
- `cors`: Middleware para permitir peticiones desde diferentes orígenes.
- `mysql2`: Cliente de base de datos para MySQL.
- `jsonwebtoken`: Implementación de seguridad basada en tokens.
- `path`: Módulo nativo para manejo de rutas de archivos.

## Funcionalidades y Endpoints

### 1. Sistema de Autenticación (JWT)
El script define el middleware `verificarToken` que extrae el token del encabezado `Authorization`. Valida el token contra la `SECRET_KEY` y decodifica la identidad del usuario para ser usada en peticiones posteriores.

### 2. Endpoints de la API
- **Login (`POST /api/login`)**: Verifica las credenciales del usuario y devuelve un token firmado si la contraseña es correcta.
- **Gestión de Usuarios**:
    - `POST /api/usuario`: Registro de nuevos perfiles.
    - `GET /api/usuario`: Listado total de usuarios (protegido).
    - `DELETE /api/usuario/:id`: Eliminación física de un usuario.
- **Gestión de Materiales**:
    - `POST /api/articulo`: Inserción de nuevos artículos al inventario.
    - `PUT /api/articulo/:id`: Actualización de datos existentes.
    - `GET /api/consultar/articulo`: Consulta relacional con la tabla de disciplinas.
    - `GET /api/totalArt`: Cálculo programático de totales y disponibilidad de "Libre".

### 3. Servidor de Archivos Estáticos
El servidor está configurado para servir todos los archivos del frontend (HTML, CSS, JS) desde el directorio raíz, asegurando que la aplicación sea autónoma.

## Configuración
- **Puerto**: `3001`
- **Seguridad**: Clave secreta definida para firma de tokens.
