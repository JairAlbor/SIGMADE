// ============================================================
//  SIGMADE – modal-catalogo.js
//  Control del formulario de catálogo + bienvenida + rol
// ============================================================


document.addEventListener('DOMContentLoaded', () => {

    // ── Mostrar nombre del usuario en navbar ───────────────
    const usuarioInfoStr = localStorage.getItem('usuarioInfo');
    const usuario = usuarioInfoStr ? JSON.parse(usuarioInfoStr) : null;

    const saludoElemento = document.getElementById('userName');
    if (saludoElemento && usuario?.nombre) {
        saludoElemento.textContent = `${usuario.nombre} ${usuario.apellidos || ''}`;
    }

    // ── Referencias ────────────────────────────────────────
    const btnAbrir = document.getElementById('btn-abrir-formulario');
    const btnCancelar = document.getElementById('btn-cancelar');
    const contenedorForm = document.getElementById('contenedor-formulario');

    // ── Control del formulario (solo si el elemento existe) ─
    if (btnAbrir && contenedorForm) {
        btnAbrir.addEventListener('click', () => {
            contenedorForm.classList.remove('hidden');
            // Scroll suave al formulario
            contenedorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Ocultar formulario
    btnCancelar.addEventListener('click', () => {
        contenedorForm.classList.add('hidden');
    });

    btnGuardar.addEventListener('click', () => {
        contenedorForm.classList.add('hidden');
        // Aquí puedes agregar la lógica para guardar el material, por ejemplo, enviar los datos a tu servidor o actualizar la tabla
    });
    function logout() {
        // 1. Opcional: Limpiar datos del usuario (token, nombre, etc.)
        // localStorage.removeItem('userToken');
        // sessionStorage.clear();

        // 2. Redirigir al login
        window.location.href = "index.html"; // Asegúrate de que el nombre del archivo coincida
    }