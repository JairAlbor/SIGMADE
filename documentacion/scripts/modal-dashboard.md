# Documentación de Script: modal-dashboard.js

## Descripción
Añade interactividad al Dashboard principal del usuario y proporciona utilidades de diagnóstico de seguridad.

## Funciones Principales
### 1. Pruebas de Integridad JWT (`probarRutaProtegida`)
- Recupera el token asíncronamente desde el `localStorage`.
- Realiza una llamada de prueba a la ruta protegida `/api/test`.
- Desglosa visualmente el contenido decodificado del token (Payload) en una alerta para verificación técnica inmediata por parte del desarrollador o administrador.
