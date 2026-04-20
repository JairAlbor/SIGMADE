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

    const btnGuardar = document.getElementById('btn-exito');
    if (btnGuardar && contenedorForm) {
        btnGuardar.addEventListener('click', () => {
             // El cierre del modal ahora lo maneja app.js tras guardar con éxito,
             // o podemos dejar que se cierre aquí si prefieres un cierre inmediato.
             // contenedorForm.classList.add('hidden');
        });
    }
    function logout() {
        // 1. Opcional: Limpiar datos del usuario (token, nombre, etc.)
        // localStorage.removeItem('userToken');
        // sessionStorage.clear();

        // 2. Redirigir al login
        window.location.href = "index.html"; // Asegúrate de que el nombre del archivo coincida
    }
});