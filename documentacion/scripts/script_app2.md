# Documentación de Script: app2.js

## Descripción
`app2.js` se especializa en la lógica de creación de nuevos artículos y la gestión de la interfaz del formulario de inserción. Proporciona una capa de interacción separada para mejorar la mantenibilidad del código.

## Funciones Principales

### 1. Gestión del Formulario (`guardarArticulo`)
- **Evento**: Se activa al enviar el formulario `formArticulo`.
- **Lógica**: 
    - Previene el refresco por defecto de la página.
    - Captura los valores de nombre, disciplina, estado y disponibilidad.
    - Realiza una petición asíncrona (`fetch`) al endpoint `/api/articulo`.
    - Incluye manejo de errores robusto para alertar al usuario en caso de fallos en la red o respuestas negativas del servidor.
    - Limpia el formulario y lo oculta tras una inserción exitosa.

### 2. Control de Interfaz (UI)
- **Mostrar Formulario**: Escucha el clic en el botón `btn-abrir-formulario` para remover la clase `hidden`, permitiendo la entrada de datos.
- **Cancelar Registro**: Permite cerrar el contenedor del formulario y resetear los campos mediante el botón `btn-cancelar`.

## Integración con Backend
El script utiliza rutas relativas para las llamadas a la API, facilitando el despliegue en entornos de producción donde el host puede variar.
