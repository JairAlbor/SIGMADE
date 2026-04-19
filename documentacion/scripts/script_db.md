# Documentación de Script: backend/db.js

## Descripción
Este script gestiona la conexión persistente con la base de datos MySQL. Es el punto único de configuración de la base de datos para todo el backend.

## Dependencias
- `mysql2`: Biblioteca Node.js para interactuar con bases de datos MySQL.

## Configuración de Conexión
El script define una conexión con los siguientes parámetros predeterminados:
- **Host**: `localhost`
- **Usuario**: `root`
- **Password**: (Vacío)
- **Base de Datos**: `basesilla`

## Funcionalidad
- **mysql.createConnection()**: Inicializa el objeto de conexión.
- **connection.connect()**: Establece la conexión física con el servidor MySQL. Incluye un manejador de errores que registra fallos en la consola para depuración.
- **module.exports**: Exporta el objeto `connection` para que pueda ser reutilizado por `server.js` y otros módulos, evitando la creación programática de múltiples conexiones innecesarias.
