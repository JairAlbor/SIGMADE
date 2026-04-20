document.addEventListener('DOMContentLoaded', () => {
    // RECUPERAR el nombre
    const nombreGuardado = localStorage.getItem('usuarioInfo');
    const usuario = JSON.parse(nombreGuardado);

    // Verificar si existe (por seguridad)
    if (usuario && usuario.nombre) {
        // Ejemplo: Ponerlo en un elemento con id="bienvenida"
        const saludoElemento = document.getElementById('userName');
        if (saludoElemento) {
            saludoElemento.textContent = `Bienvenido, ${usuario.nombre}`;
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
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

async function probarRutaProtegida() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("⚠️ No hay token guardado. Debes iniciar sesión primero.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/test`, {
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

// ============== NUEVO PRÉSTAMO / CANCHA (ALUMNO) ==============
async function cargarMaterialesCanchas() {
    try {
        const res = await fetch(`${API_BASE}/api/articulo/disponibles`);
        const data = await res.json();
        const sel = document.getElementById('alumnoMaterialSelect');
        if(!sel) return;
        sel.innerHTML = '<option value="">Selecciona una opción...</option>';
        if (data.success) {
            data.materiales.forEach(m => {
                sel.innerHTML += `<option value="${m.id}">${m.nombre_material} - ${m.nombre_disciplina}</option>`;
            });
        }
    } catch(e) { console.error(e); }
}

function openNuevoPrestamoModal() {
    const overlay = document.getElementById('nuevoPrestamoOverlay');
    if(overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        cargarMaterialesCanchas();
        
        // Auto-fill today's date for fecha_sol
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('alumnoFechaSol').value = today;
    }
}

function closeNuevoPrestamoModal() {
    const overlay = document.getElementById('nuevoPrestamoOverlay');
    if(overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        document.getElementById('alumnoMaterialSelect').value = '';
        document.getElementById('alumnoFechaLim').value = '';
        document.getElementById('alumnoObs').value = '';
    }
}

async function solicitarPrestamoAlumno() {
    const usuarioInfo = JSON.parse(localStorage.getItem('usuarioInfo') || '{}');
    const tokenPayload = jwtDecodeProxy(localStorage.getItem('userToken')); // We assume back extracts from token.
    // Instead of passing user ID, the backend uses req.user.id if modified correctly, 
    // but the backend logic for POST /api/prestamo currently expects `usuario_id` in body.
    // Let's grab the `id` from the verified token payload we fetched or stored on login.
    let userId = null;
    if(tokenPayload) userId = tokenPayload.id;

    if(!userId) {
        // Fallback: If we didn't save the ID in user info, maybe we did? 
        // We actually saved id in user object on login!
        const lsUsuario = JSON.parse(localStorage.getItem('usuarioInfo'));
        // Wait, did we save id in user object? YES, via server.js: user: { id: ...}
        // Let's double check if it's there. We can use the token.
    }
    
    // Just grab it from token via a quick parse
    function parseJwt (token) {
        try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
    }
    const token = localStorage.getItem('userToken');
    const userPayload = parseJwt(token);
    const usuario_id = userPayload ? userPayload.id : null;

    if(!usuario_id) return alert('Error de sesión.');

    const material_ids = [parseInt(document.getElementById('alumnoMaterialSelect').value)];
    const fecha_limite = document.getElementById('alumnoFechaLim').value;
    const observaciones = document.getElementById('alumnoObs').value;

    if(!material_ids[0] || !fecha_limite) {
        return alert("Selecciona un material y la fecha límite de entrega.");
    }

    try {
        const res = await fetch(`${API_BASE}/api/prestamo`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ usuario_id, material_ids, fecha_limite, observaciones })
        });
        const data = await res.json();
        
        if(data.success) {
            alert('✅ Solicitud enviada correctamente. Espera la aprobación.');
            closeNuevoPrestamoModal();
        } else if (data.conflicto) {
             const obs = data.conflictos.map(c => `Ya reservado hasta: ${new Date(c.reservado_hasta).toLocaleString()}`).join('\n');
             alert('❌ No disponible en esas fechas.\n' + obs);
        } else {
            alert('❌ ' + (data.message || data.error));
        }
    } catch(err) {
        console.error(err);
        alert("Error de conexión.");
    }
}

// ============== EVENTOS ==============
function openMisEventosModal() {
    const overlay = document.getElementById('misEventosOverlay');
    if(overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        renderMisEventos();
    }
}

function closeMisEventosModal() {
    const overlay = document.getElementById('misEventosOverlay');
    if(overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

async function renderMisEventos() {
    const container = document.getElementById('listaMisEventos');
    container.innerHTML = '<p style="text-align:center; color:#666;">Cargando eventos...</p>';
    try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE}/api/evento`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if(data.success) {
            if(data.eventos.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#666;">No hay eventos próximos.</p>';
                return;
            }
            container.innerHTML = data.eventos.map(e => `
                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:15px; margin-bottom:10px;">
                    <h4 style="margin:0 0 5px 0;">${e.titulo}</h4>
                    <p style="margin:0; font-size:0.85rem; color:#4b5563;"><i data-lucide="calendar" style="width:14px;"></i> ${e.fecha} | <i data-lucide="clock" style="width:14px;"></i> ${e.hora_inicio} - ${e.hora_fin}</p>
                    <p style="margin:5px 0 0 0; font-size:0.85rem; color:#666;"><i data-lucide="map-pin" style="width:14px;"></i> ${e.ubicacion}</p>
                </div>
            `).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            container.innerHTML = '<p style="text-align:center; color:red;">No se pudieron cargar los eventos.</p>';
        }
    } catch(e) {
        console.error(e);
        container.innerHTML = '<p style="text-align:center; color:red;">Error de red.</p>';
    }
}