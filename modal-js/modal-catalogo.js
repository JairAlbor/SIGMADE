/**codigo para conseguir el nombre del usuario */

document.addEventListener('DOMContentLoaded', () => {
    // RECUPERAR el nombre
    const nombreGuardado = localStorage.getItem('nombreUsuario');

    // Verificar si existe (por seguridad)
    if (nombreGuardado) {
        // Ejemplo: Ponerlo en un elemento con id="bienvenida"
        const saludoElemento = document.getElementById('userName');
        if (saludoElemento) {
            saludoElemento.textContent = `Bienvenido, ${nombreGuardado}`;
        }
        
        // Si quieres usarlo dentro de un modal específico:
        console.log("Nombre listo para usar en modales:", nombreGuardado);
    } else {
        // Si no hay nombre, quizá el usuario no se ha logueado
      ///  window.location.href = 'login.html'; 
    }
});         

const btnAbrir = document.getElementById('btn-abrir-formulario');
const btnCancelar = document.getElementById('btn-cancelar');
const contenedorForm = document.getElementById('contenedor-formulario');
const btnGuardar = document.getElementById('btn-exito');
// Mostrar formulario
btnAbrir.addEventListener('click', () => {
    contenedorForm.classList.remove('hidden');
});

// Ocultar formulario
btnCancelar.addEventListener('click', () => {
    contenedorForm.classList.add('hidden');
});

btnGuardar.addEventListener('click', () => {
contenedorForm.classList.add('hidden');
// Aquí puedes agregar la lógica para guardar el material, por ejemplo, enviar los datos a tu servidor o actualizar la tabla
    });