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
function logout() {
    // 1. Limpiar datos del usuario y el token de seguridad
    localStorage.removeItem('userToken');
    localStorage.removeItem('usuarioInfo');

    // 2. Redirigir al login
    window.location.href = "index.html"; 
}

// ============== FUNCIÓN PARA PROBAR EL TOKEN (JWT) ==============
async function probarRutaProtegida() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("⚠️ No hay token guardado. Debes iniciar sesión primero.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/test", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        const data = await response.json();
        
        if (data.success) {
            alert("✅ Éxito:\n" + data.message + "\n\nDatos desde el token: " + JSON.stringify(data.datosDelToken, null, 2));
            console.log("Prueba superada:", data);
        } else {
            alert("❌ Denegado:\n" + data.message);
        }
    } catch (error) {
        console.error("Error al probar token:", error);
        alert("Error de red intentando probar el token.");
    }
}