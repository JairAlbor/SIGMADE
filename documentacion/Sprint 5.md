# Sprint 5 – Pruebas Finales y Ajustes (Semanas 10–11)

**Objetivo**: Asegurar la calidad del software.

## Actividades y Artefactos: Documentación Técnica

---

# 1. Arquitectura y Stack Tecnológico

## Introducción
SIGMADE (Sistema de Gestión de Materiales y Deporte) es una plataforma web para centralizar y optimizar el control de inventario de equipos deportivos y materiales educativos.

## Arquitectura del Sistema
El sistema sigue una arquitectura de **Cliente-Servidor**:
- **Frontend**: Aplicación SPA con HTML5, CSS3 y JavaScript Vanilla.
- **Backend**: Servidor REST con Node.js y Express.
- **Base de Datos**: MySQL.

## Stack Tecnológico
| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express |
| **Base de Datos** | MySQL |
| **Autenticación** | JSON Web Tokens (JWT) |

---

# 2. Documentación de Scripts (Backend)

## script_server.js
Motor principal que gestiona las rutas de la API y la autenticación.
- **Login**: Verifica credenciales y firma tokens JWT.
- **Gestión**: CRUD de usuarios y materiales protegido por middleware.

## script_db.js
Gestión de la conexión persistente con MySQL. Punto único de configuración en `localhost` con la base de datos `basesilla`.

---

# 3. Documentación de Scripts (Frontend Core)

## script_app.js
Controlador principal para el inventario. Maneja la carga dinámica de artículos y la lógica de inicio de sesión.

## script_app2.js
Especializado en el formulario de inserción de nuevos materiales con validaciones y manejo de errores.

## script_app3.js
Centraliza la gestión administrativa de usuarios y contadores globales.

---

# 4. Documentación de Scripts (Modales y UI)

## script_modal.js
Interactividad del catálogo con filtros de búsqueda en tiempo real y estética glassmorphism.

## script_profile.js
Visualización de datos del perfil de usuario y lógica de cierre de sesión seguro.

---

# 5. Componentes de Interacción y Seguridad

## modal-admi.md
Personalización del saludo administrativo y funciones de salida del panel.

## modal-catalogo.md
Control específico de formularios de registro dentro del catálogo.

## modal-dashboard.md
Utilidades de diagnóstico para verificar la integridad del token JWT.

## modal-eventos.md
Gestión de calendarios, eventos deportivos y disciplinas en memoria.

## verificarSesion.md
Middleware de frontend (Route Guard) que redirige al login si no se detecta un token válido.
