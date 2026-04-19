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
/**********************************************/
function logout() {
    // 1. Opcional: Limpiar datos del usuario (token, nombre, etc.)
    // localStorage.removeItem('userToken');
    // sessionStorage.clear();

    // 2. Redirigir al login
    window.location.href = "index.html"; // Asegúrate de que el nombre del archivo coincida
}
