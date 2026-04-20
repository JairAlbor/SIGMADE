document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener la información del usuario del localStorage
    const usuarioInfoStr = localStorage.getItem('usuarioInfo');
    if (!usuarioInfoStr) {
        // Redirigir al login si no hay sesión
        const currentPath = window.location.pathname;
        if (!currentPath.includes('index.html') && !currentPath.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return;
    }

    const usuarioInfo = JSON.parse(usuarioInfoStr);

    const elUserName = document.getElementById("userName");
    if (elUserName) {
        // Usar formato serio
        elUserName.textContent = `Hola, ${usuarioInfo.nombre}`;
    }

    // 3. Manejo universal de funcionalidad "Cerrar sesión"
    // Buscamos si existe un botón o texto destinado al logout en la página
    const logoutBtn = document.getElementById("btnLogout") || document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem('usuarioInfo');
            window.location.href = 'index.html';
        });
    }

    // 4. Utilidad para navegación dinámica basada en el rol (ej. botón "Inicio")
    window.irAInicio = function() {
        if (usuarioInfo.rol === 'Admin' || usuarioInfo.rol === 'Operador') {
            window.location.href = 'administracion.html';
        } else {
            window.location.href = 'Dashboard.html';
        }
    };

    // Actualizar enlaces de navegación de inicio automáticamente si tienen la clase "nav-inicio"
    const navInicio = document.querySelectorAll(".nav-item.nav-inicio");
    navInicio.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            irAInicio();
        };
    });

    // Auto-marcar pestaña activa
    const allNavItems = document.querySelectorAll('.nav-menu .nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    
    const pathname = window.location.pathname.toLowerCase();
    if(pathname.includes('catalogo.html')) {
        allNavItems.forEach(item => { if(item.textContent.toLowerCase().includes('catálogo')) item.classList.add('active'); });
    } else if(pathname.includes('profile.html')) {
        allNavItems.forEach(item => { if(item.textContent.toLowerCase().includes('perfil')) item.classList.add('active'); });
    } else {
        // Asignar inicio
        allNavItems.forEach(item => { if(item.textContent.toLowerCase().includes('inicio')) item.classList.add('active'); });
    }
});

window.logout = function() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('usuarioInfo');
    window.location.href = "index.html"; 
};
