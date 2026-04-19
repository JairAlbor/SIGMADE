# Documentación Técnica - Proyecto SIGMADE

## 1. Introducción
SIGMADE (Sistema de Gestión de Materiales y Deporte) es una plataforma web diseñada para centralizar y optimizar el control de inventario de equipos deportivos y materiales educativos. El sistema permite el seguimiento en tiempo real de la disponibilidad de artículos, la gestión de usuarios y la visualización de estadísticas clave para la toma de decisiones administrativas.

## 2. Arquitectura del Sistema
El sistema sigue una arquitectura de **Cliente-Servidor** (MVC simplificado):
- **Frontend**: Aplicación de página única (SPA) construida con HTML5, CSS3 (Vanilla) y JavaScript (ES6+). Se comunica con el servidor mediante peticiones asíncronas (Fetch API).
- **Backend**: Servidor RESTful desarrollado en Node.js utilizando el framework Express.
- **Base de Datos**: Sistema de gestión de bases de datos relacionales MySQL para el almacenamiento persistente de usuarios, materiales y disciplinas.

## 3. Stack Tecnológico
| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express |
| **Base de Datos** | MySQL |
| **Autenticación** | JSON Web Tokens (JWT) |
| **Middleware** | CORS, Express.json |

## 4. Base de Datos
El esquema de la base de datos se compone de las siguientes tablas principales:
- **usuario**: Almacena credenciales, roles (Admin/User), datos de contacto y estatus.
- **material**: Contiene el inventario de artículos, incluyendo estado físico, tipo de material y disponibilidad.
- **disciplina**: Categorías a las que pertenecen los materiales (ej: Deporte, Libros).

## 5. API Endpoints
### Autenticación y Usuarios
- `POST /api/login`: Valida credenciales y retorna un JWT.
- `POST /api/usuario`: Registra un nuevo usuario en el sistema.
- `GET /api/usuario`: Obtiene la lista de todos los usuarios (Protegido).
- `DELETE /api/usuario/:id`: Elimina un usuario por ID (Protegido).
- `GET /api/usuario/num`: Estadísticas de usuarios activos/inactivos (Protegido).

### Materiales y Artículos
- `GET /api/consultar/articulo`: Lista completa de materiales con detalles de disciplina (Protegido).
- `POST /api/articulo`: Registra un nuevo material (Protegido).
- `PUT /api/articulo/:id`: Actualiza la información de un material (Protegido).
- `DELETE /api/articulo/:id`: Elimina un material del inventario (Protegido).
- `GET /api/totalArt`: Retorna el conteo total y artículos disponibles (Protegido).

## 6. Seguridad
La seguridad se implementa mediante:
1. **JWT (JSON Web Tokens)**: Las rutas sensibles están protegidas por un middleware que verifica la validez del token enviado en el encabezado `Authorization: Bearer <token>`.
2. **Validación de Roles**: El sistema diferencia entre administradores y usuarios estándar para restringir el acceso a funciones de gestión avanzada.
