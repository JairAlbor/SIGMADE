document.addEventListener('DOMContentLoaded', () => {
    // API URL Detección dinámica
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    //Recuperacion de datos del localStronge
    const infoUsuario = localStorage.getItem('usuarioInfo');
    if (!infoUsuario) return;

    const usuario = JSON.parse(infoUsuario);

    // Nombre en el muenu y en el perfil
    document.getElementById('userName').textContent = `Hola, ${usuario.nombre}`;
    document.getElementById('profileName').textContent = `${usuario.nombre} ${usuario.apellidos}`;
    document.getElementById('profileEmail').textContent = usuario.email;
    document.getElementById('profileTelefono').textContent = usuario.telefono;
    document.getElementById('profileRol').textContent = usuario.rol;
    document.getElementById('profileEstatus').textContent = usuario.estatus;
    document.getElementById('profileCreateAt').textContent = new Date(usuario.create_at).toLocaleDateString();
    
    // Custom info
    if(usuario.ubicacion) document.getElementById('profileUbicacion').textContent = usuario.ubicacion;
    if(usuario.fecha_nacimiento) {
        document.getElementById('profileNacimiento').textContent = "Nacimiento: " + new Date(usuario.fecha_nacimiento).toLocaleDateString('es-MX', { timeZone: 'UTC' });
    }

    cargarHistorialPrestamos();
});

async function cargarHistorialPrestamos() {
    try {
        const res = await fetch(`${API_BASE}/api/perfil/historial`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        const data = await res.json();
        
        const placeholder = document.querySelector('.activity-placeholder');
        if (!placeholder) return;
        
        if (data.success && data.prestamos.length > 0) {
            placeholder.innerHTML = data.prestamos.map(p => `
                <div style="background:var(--blanco); border:1px solid #e5e7eb; padding:15px; border-radius:8px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <strong>${p.materiales || 'Material General'}</strong>
                        <span style="background:#f3f4f6; padding:4px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold;">${p.estado_general}</span>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.85rem; color:#4b5563;">
                        <div><i data-lucide="calendar" style="width:14px; height:14px; margin-right:4px;"></i> Solicitud: ${new Date(p.fecha_solicitud).toLocaleDateString()}</div>
                        <div><i data-lucide="clock" style="width:14px; height:14px; margin-right:4px;"></i> Límite: ${new Date(p.fecha_limite).toLocaleDateString()}</div>
                        ${p.fecha_entrega ? `<div><i data-lucide="check-circle" style="width:14px; height:14px; margin-right:4px; color:green;"></i> Entregado: ${new Date(p.fecha_entrega).toLocaleDateString()}</div>` : ''}
                    </div>
                </div>
            `).join('');
            // reload icons for the new HTML
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            // Stats Update Optional
            const freqElem = document.getElementById('profileFrecuencia');
            if (freqElem) freqElem.textContent = `${data.prestamos.length} préstamo(s) en el historial`;
        } else {
            placeholder.innerHTML = '<p style="color:#6b7280; text-align:center; padding:20px;">No tienes historial de préstamos aún.</p>';
            const freqElem = document.getElementById('profileFrecuencia');
            if (freqElem) freqElem.textContent = '0 préstamos';
        }
    } catch(err) {
        console.error('Error fetching historial:', err);
    }
}
function logout() {
    // 1. Limpiar datos del usuario (token, INFO, etc.)
    localStorage.removeItem('userToken');
    localStorage.removeItem('usuarioInfo');

    // 2. Redirigir al login
    window.location.href = "index.html"; // Asegúrate de que el nombre del archivo coincida
}