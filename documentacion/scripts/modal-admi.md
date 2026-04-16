# Documentación de Script: modal-admi.js

## Descripción
Script auxiliar para el panel de administración que gestiona la personalización de la interfaz y la seguridad de la sesión administrativa.

## Funciones Principales
### 1. Saludo Personalizado
- Recupera el `nombreUsuario` del almacenamiento local.
- Inyecta un saludo dinámico en el elemento `userName`.
- Incluye validaciones para asegurar que el nombre esté disponible antes de intentar manipular el DOM.

### 2. Cierre de Sesión Extendido
- Proporciona una función `logout` específica que asegura la redirección a la página de inicio.
- Diseñado para ser invocado desde los menús de administración.
