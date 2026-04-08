// Escudo visual: Se ejecuta antes de cargar la página
(function verificarSesionVip() {
    // Si no hay token guardado...
    const tokenSeguro = localStorage.getItem('userToken');

    if (!tokenSeguro) {
        alert("🔒 Acceso Denegado: Debes iniciar sesión para ver esta pantalla.");
        // Lo mandamos al inicio
        window.location.replace("index.html");
    }
})();
