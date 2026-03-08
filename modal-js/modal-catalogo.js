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
alert('Material guardado con éxito');
});