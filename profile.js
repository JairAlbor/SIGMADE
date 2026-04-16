document.addEventListener('DOMContentLoaded', async () =>{
    const infoUsuario = localStorage.getItem('usuarioInfo');
    if(!infoUsuario) return;
    
    const usuario = JSON.parse(infoUsuario);

    // Esta parte se omite ya que nav-utils maneja el "userName" del top bar.
    // document.getElementById('userName').textContent = `Hola, ${usuario.nombre}`;

    // Llenar información en el perfil
    const elProfileName = document.getElementById('profileName');
    if (elProfileName) elProfileName.textContent = `${usuario.nombre} ${usuario.apellidos}`;
    
    document.getElementById('profileEmail').textContent = usuario.email || 'No disponible';
    document.getElementById('profileTelefono').textContent = usuario.telefono || 'No disponible';
    document.getElementById('profileRol').textContent = usuario.rol || 'No disponible';
    document.getElementById('profileEstatus').textContent = usuario.estatus || 'Activo';
    
    if (usuario.create_at) {
        document.getElementById('profileCreateAt').textContent = new Date(usuario.create_at).toLocaleDateString();
    }

    const frecuenciaMaterial = usuario.frecuencia ? "Es Frecuente" : 'No es Frecuente';
    const elFrecuencia = document.getElementById('profileFrecuencia');
    if (elFrecuencia) elFrecuencia.textContent = frecuenciaMaterial;

    // Obtener el historial dinámicamente
    await cargarHistorial(usuario.id);
});

async function cargarHistorial(userId) {
    const container = document.querySelector('.activity-placeholder');
    if (!container) return;
    
    container.innerHTML = '<p>Cargando historial...</p>';

    try {
        const response = await fetch(`/api/perfil/${userId}/prestamos`);
        const data = await response.json();

        if (data.success && data.prestamos.length > 0) {
            container.innerHTML = ''; // Limpiar
            const ul = document.createElement('ul');
            ul.className = 'activity-list';

            data.prestamos.forEach(p => {
                const li = document.createElement('li');
                li.className = 'activity-item';
                
                // Determinar el color según el estado general
                let colorClass = 'status-default';
                if (p.estado_general === 'Activo' || p.estado_general === 'Abierto') colorClass = 'status-active';
                if (p.estado_general === 'En progreso') colorClass = 'status-progress';
                if (p.estado_general === 'Cerrado' || p.estado_general === 'Entregado') colorClass = 'status-closed';
                if (p.estado_general === 'Vencido') colorClass = 'status-overdue';

                li.innerHTML = `
                    <div class="activity-icon">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <div class="activity-details">
                        <h4>Material: ${p.materiales || 'Desconocido'}</h4>
                        <p>Solicitado el ${new Date(p.fecha_solicitud).toLocaleDateString()} — Límite: ${new Date(p.fecha_limite).toLocaleDateString()}</p>
                    </div>
                    <div class="activity-status">
                        <span class="status-badge ${colorClass}">${p.estado_general}</span>
                    </div>
                `;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        } else {
            container.innerHTML = '<p>No tienes préstamos registrados.</p>';
        }
    } catch (err) {
        console.error("Error cargando historial de perfil:", err);
        container.innerHTML = '<p style="color:red;">Error al cargar el historial conectando con el servidor.</p>';
    }
}