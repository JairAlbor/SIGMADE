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
    const btnAbrir     = document.getElementById('btn-abrir-formulario');
    const btnCancelar  = document.getElementById('btn-cancelar');
    const contenedorForm = document.getElementById('contenedor-formulario');

    // ── Control del formulario (solo si el elemento existe) ─
    if (btnAbrir && contenedorForm) {
        btnAbrir.addEventListener('click', () => {
            contenedorForm.classList.remove('hidden');
            // Scroll suave al formulario
            contenedorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (btnCancelar && contenedorForm) {
        btnCancelar.addEventListener('click', () => {
            contenedorForm.classList.add('hidden');
            document.getElementById('formArticulo')?.reset();
            const cantInput = document.getElementById('cantidadArticulo');
            if (cantInput) cantInput.value = 1;
        });
    }
});