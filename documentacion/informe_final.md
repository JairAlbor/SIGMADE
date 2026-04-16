# Informe Final de Proyecto - SIGMADE

## 1. Resumen Ejecutivo
El proyecto SIGMADE ha concluido exitosamente sus fases de desarrollo planeadas para los Sprints 5 y 6. El sistema cumple con los requisitos funcionales de gestión de inventario, control de usuarios y seguridad basada en tokens, proporcionando una herramienta robusta para la administración de materiales deportivos.

## 2. Objetivos Logrados
- **Sprint 5 (Estabilización y Pruebas)**:
    - Implementación completa de la API REST para materiales y usuarios.
    - Integración de validaciones en el lado del servidor y del cliente.
    - Pruebas de usabilidad satisfactorias en los módulos de Inventario y Dashboard.
- **Sprint 6 (Seguridad y Entrega Final)**:
    - Aseguramiento de todas las rutas críticas mediante JSON Web Tokens (JWT).
    - Implementación de middlewares de verificación de sesión en el frontend.
    - Generación de documentación técnica y manuales de operación.

## 3. Resultados de Pruebas
| Caso de Prueba | Resultado | Observaciones |
| :--- | :--- | :--- |
| **Inicio de Sesión** | ✅ Exitoso | Generación de token correcta y redirección por rol. |
| **Registro de Usuarios** | ✅ Exitoso | Persistencia en BD MySQL verificada. |
| **Gestión de Materiales** | ✅ Exitoso | Operaciones CRUD funcionales y seguras. |
| **Seguridad JWT** | ✅ Exitoso | Acceso denegado a rutas sin token válido. |

## 4. Retrospectiva Global
### Fortalezas
- Arquitectura escalable y código modular.
- Interfaz de usuario intuitiva y moderna (Vanilla CSS).
- Manejo eficiente de sesiones y seguridad.

### Desafíos Superados
- La integración de JWT requirió una reestructuración de todas las llamadas `fetch` en el frontend para incluir los encabezados de autorización.
- El manejo de concurrencia en el estado de materiales "Libre/Ocupado".

## 5. Lecciones Aprendidas
- La importancia de una planificación de API sólida antes de iniciar el desarrollo del frontend.
- La utilidad de los middlewares en Express para mantener el código de las rutas limpio y centrado en la lógica de negocio.

## 6. Conclusión
SIGMADE se entrega como un producto listo para su despliegue en un entorno controlado, cumpliendo con los estándares de calidad y seguridad requeridos para su propósito administrativo.
