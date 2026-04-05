document.addEventListener('DOMContentLoaded', () =>{
    //Recuperacion de datos del localStronge
    const infoUsuario = localStorage.getItem('usuarioInfo');

    // Convertir la cadena JSON de vuelta a un objeto
    const usuario = JSON.parse(infoUsuario);

    // Nombre en el muenu y en el perfil
    document.getElementById('userName').textContent = `Hola, ${usuario.nombre}`;
    document.getElementById('profileName').textContent = `${usuario.nombre} ${usuario.apellidos}`;
    //Informacion del usuario
    document.getElementById('profileEmail').textContent = usuario.email;
    document.getElementById('profileTelefono').textContent = usuario.telefono;
    document.getElementById('profileRol').textContent = usuario.rol;
    document.getElementById('profileEstatus').textContent = usuario.estatus;
    document.getElementById('profileCreateAt').textContent = new Date(usuario.create_at).toLocaleDateString();

});
function logout() {
    // 1. Opcional: Limpiar datos del usuario (token, nombre, etc.)
    // localStorage.removeItem('userToken');
    // sessionStorage.clear();

    // 2. Redirigir al login
    window.location.href = "index.html"; // Asegúrate de que el nombre del archivo coincida
}