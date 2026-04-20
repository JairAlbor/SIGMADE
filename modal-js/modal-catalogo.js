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
        btnAbrir.onclick = () => {
            console.log('Abriendo formulario...');
            contenedorForm.classList.remove('hidden');
            contenedorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    }

    // Ocultar formulario
    btnCancelar.addEventListener('click', () => {
        contenedorForm.classList.add('hidden');
    });

    const tbGuardar = document.getElementById('btn-guardar-articulo');
    if (tbGuardar) {
        tbGuardar.addEventListener('click', () => {
            contenedorForm.classList.add('hidden');
        });
    }
});

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('usuarioInfo');
    window.location.href = "index.html";
}