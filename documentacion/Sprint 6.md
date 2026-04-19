# Sprint 6 – Cierre del Proyecto (Semanas 12–13)

**Objetivo**: Entregar el producto final.

## 1. Manual de Usuario (Documentación de Usuario)

### Acceso al Sistema
Para iniciar sesión, ingrese su matrícula y contraseña. El sistema lo redirigirá automáticamente según su rol (Admin o Usuario).

### Dashboard y Funciones
- **Nuevo Préstamo**: Solicite materiales disponibles.
- **Catálogo**: Visualice el inventario en tiempo real con categorías (Deporte/Libros).
- **Gestión (Admin)**: Tablero de control de usuarios y materiales.

### Seguridad
El sistema utiliza sesiones protegidas. Al finalizar su trabajo, asegúrese de usar el botón de **Cerrar Sesión** para invalidar su token de acceso.

---

## 2. Informe Final del Proyecto

### Resumen del Proyecto
SIGMADE se entrega como una plataforma estable que centraliza la gestión deportiva. Cumple con todos los requisitos funcionales de los Sprints core.

### Resultados de los Sprints
- **Sprint 1-4**: Desarrollo de la base de datos y la interfaz inicial.
- **Sprint 5**: Integración de seguridad JWT, optimización del código y pruebas finales.
- **Sprint 6**: Cierre administrativo, manuales y entrega de documentación.

### Resultados de Pruebas
| Caso de Prueba | Resultado |
| :--- | :--- |
| Login con JWT | Exitoso |
| CRUD de Materiales | Exitoso |
| Gestión de Usuarios | Exitoso |

### Retrospectiva y Lecciones Aprendidas
- **Sprint Retrospective**: Se logró una coordinación eficiente entre el backend y el frontend tras estandarizar los JSON de respuesta.
- **Lecciones aprendidas**: El uso de Vanilla JavaScript permitió un control total sobre el rendimiento y la estética del sitio sin depender de librerías externas pesadas.
