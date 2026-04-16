// ======================== EVENTOS ========================
let events = [
    { id: 1, title: 'Conferencia de Tecnología 2026', date: '28 Feb 2026', time: '10:00 AM', location: 'Auditorio Principal', attendees: 45 },
    { id: 2, title: 'Torneo de Fútbol Intercolegial', date: '5 Mar 2026', time: '3:00 PM', location: 'Cancha #1', attendees: 22 }
];

const overlay = document.getElementById('eventModalOverlay');
const eventList = document.getElementById('eventList');
const addForm = document.getElementById('addEventForm');

function openEvents() {
    overlay.classList.remove('hidden');
    renderEvents();
}

function closeModal() {
    overlay.classList.add('hidden');
}

function toggleEventForm(show = true) {
    if (show && addForm.classList.contains('hidden')) {
        addForm.classList.remove('hidden');
    } else {
        addForm.classList.add('hidden');
    }
}

function renderEvents() {
    eventList.innerHTML = '';
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3>${event.title}</h3>
                    <div class="event-details-grid">
                        <span>📅 ${event.date}</span>
                        <span>⏰ ${event.time}</span>
                        <span>📍 ${event.location}</span>
                        <span>👥 ${event.attendees} inscritos</span>
                    </div>
                </div>
                <button onclick="deleteEvent(${event.id})" style="border:none; background:none; cursor:pointer; color:red;">🗑️</button>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-close-footer" style="background: white; color: #374151; border: 1px solid #d1d5db;">Ver detalles</button>
                <button class="btn-register">Lista de asistentes</button>
            </div>
        `;
        eventList.appendChild(card);
    });
}

function deleteEvent(id) {
    if (confirm('¿Estás seguro de dar de baja este evento?')) {
        events = events.filter(e => e.id !== id);
        renderEvents();
    }
}

function saveEvent() {
    alert('Evento guardado (simulado)');
    toggleEventForm(false);
}

// ======================== DISCIPLINAS ========================
function openDisciplines() {
    document.getElementById('disciplineModalOverlay').classList.remove('hidden');
    cargarDisciplinas();
    cargarEntrenadoresSelect();
}

function closeDisciplines() {
    document.getElementById('disciplineModalOverlay').classList.add('hidden');
}

function toggleDisciplineForm() {
    const form = document.getElementById('disciplineForm');
    form.classList.toggle('hidden');
}

async function cargarDisciplinas() {
    try {
        const res = await fetch('/api/disciplina');
        const data = await res.json();
        const grid = document.getElementById('disciplineGrid');
        grid.innerHTML = '';

        if (data.success && data.disciplinas.length > 0) {
            data.disciplinas.forEach(d => {
                grid.innerHTML += `
                    <div class="discipline-card" style="border: 1px solid #eee; padding: 15px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <h4 style="margin:0; color:#333;">${d.nombre}</h4>
                                <p style="font-size: 0.85rem; color:#666; margin: 5px 0;">Entrenador: ${d.entrenador_nombre}</p>
                            </div>
                            <div>
                                <button onclick="eliminarDisciplina(${d.id})" style="border:none; background:none; cursor:pointer; color:#dc2626;" title="Eliminar">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = '<p style="text-align:center; color:#9ca3af; padding:20px;">No hay disciplinas registradas</p>';
        }
    } catch (err) {
        console.error('Error cargando disciplinas:', err);
    }
}

async function cargarEntrenadoresSelect() {
    try {
        const res = await fetch('/api/entrenador');
        const data = await res.json();
        const select = document.getElementById('disciplinaEntrenador');
        if (!select) return;

        select.innerHTML = '<option value="">Sin entrenador</option>';
        if (data.success) {
            data.entrenadores.forEach(e => {
                select.innerHTML += `<option value="${e.id}">${e.nombre} ${e.apellidos}</option>`;
            });
        }
    } catch (err) {
        console.error('Error cargando entrenadores:', err);
    }
}

async function saveDisciplina() {
    const nombre = document.getElementById('disciplinaNombre').value;
    const entrenador_id = document.getElementById('disciplinaEntrenador').value;

    if (!nombre) { alert('⚠️ El nombre de la disciplina es obligatorio'); return; }

    try {
        const res = await fetch('/api/disciplina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, entrenador_id: entrenador_id || null })
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ ' + data.mensaje);
            document.getElementById('disciplinaNombre').value = '';
            toggleDisciplineForm();
            cargarDisciplinas();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

async function eliminarDisciplina(id) {
    if (!confirm('¿Eliminar esta disciplina?')) return;
    try {
        const res = await fetch(`/api/disciplina/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert('✅ ' + data.mensaje);
            cargarDisciplinas();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// ======================== PRÉSTAMOS ========================
let prestamosData = [];

function openPrestamos() {
    document.getElementById('prestamoModalOverlay').classList.remove('hidden');
    cargarPrestamos();
    cargarStatsPrestamos();
    cargarSelectUsuarios();
    cargarSelectMateriales();
}

function closePrestamos() {
    document.getElementById('prestamoModalOverlay').classList.add('hidden');
}

function toggleFormPrestamo() {
    const form = document.getElementById('addPrestamoForm');
    form.classList.toggle('hidden');
}

// ====== CARGAR Y RENDERIZAR ======
async function cargarPrestamos() {
    try {
        const res = await fetch('/api/prestamo');
        const data = await res.json();
        if (data.success) {
            prestamosData = data.prestamos;
            renderPrestamos(prestamosData);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function renderPrestamos(prestamos) {
    const tbody = document.getElementById('tablaPrestamosBody');
    tbody.innerHTML = '';

    if (prestamos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:#9ca3af;">
            <i class="fa-solid fa-inbox" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
            No hay préstamos registrados</td></tr>`;
        document.getElementById('prestamoCounter').textContent = '';
        return;
    }

    prestamos.forEach(p => {
        const pillClass = getEstadoPillClass(p.estado_general);
        const fechaSol = formatFecha(p.fecha_solicitud);
        const fechaLim = formatFecha(p.fecha_limite);
        const fechaEnt = p.fecha_entrega ? formatFecha(p.fecha_entrega) : '<span style="color:#9ca3af;">—</span>';
        const materiales = p.materiales || 'Sin material';

        const esActivo = ['Abierto','Activo','Renovado','Pendiente'].includes(p.estado_general);
        let acciones = '';
        if (esActivo) {
            acciones = `
                <button class="btn-icon edit" title="Finalizar" onclick="finalizarPrestamo(${p.id})" style="color:#22c55e;"><i class="fa-solid fa-check-circle"></i></button>
                <button class="btn-icon edit" title="Renovar" onclick="renovarPrestamo(${p.id})"><i class="fa-solid fa-rotate"></i></button>
                <button class="btn-icon edit" title="Sancionar" onclick="sancionarDesdePrestamo(${p.id})" style="color:#f59e0b;"><i class="fa-solid fa-triangle-exclamation"></i></button>
                <button class="btn-icon delete" title="Eliminar" onclick="eliminarPrestamo(${p.id})"><i class="fa-solid fa-trash"></i></button>`;
        } else {
            acciones = `<button class="btn-icon delete" title="Eliminar" onclick="eliminarPrestamo(${p.id})"><i class="fa-solid fa-trash"></i></button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td><div class="user-cell"><div class="user-cell-avatar"><i class="fa-solid fa-user"></i></div><div><span class="user-cell-name">${p.usuario_nombre} ${p.usuario_apellidos||''}</span><span class="user-cell-id">${p.usuario_matricula||''}</span></div></div></td>
            <td><span class="material-tag">${materiales}</span></td>
            <td>${fechaSol}</td>
            <td>${fechaLim}</td>
            <td><span class="status-pill ${pillClass}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${p.estado_general||'N/A'}</span></td>
            <td>${fechaEnt}</td>
            <td><small>${p.observaciones||''}</small></td>
            <td><div class="actions">${acciones}</div></td>`;
        tbody.appendChild(row);
    });

    document.getElementById('prestamoCounter').textContent = `Mostrando ${prestamos.length} préstamo(s)`;
}

// ====== KPIs ======
async function cargarStatsPrestamos() {
    try {
        const res = await fetch('/api/prestamo/stats');
        const data = await res.json();
        if (data.success) {
            document.getElementById('prestamosAbiertos').textContent = data.abiertos;
            document.getElementById('prestamosVencidos').textContent = data.retraso;
            document.getElementById('prestamosCerrados').textContent = data.cerrados;
            document.getElementById('prestamosTotal').textContent = data.total;
        }
    } catch (err) { console.error('Error stats:', err); }
}

// ====== SELECTS DINÁMICOS ======
async function cargarSelectUsuarios() {
    try {
        const res = await fetch('/api/usuario');
        const data = await res.json();
        const select = document.getElementById('prestamoUsuario');
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';
        if (data.success) {
            data.usuarios.filter(u => u.estatus === 'Activo').forEach(u => {
                select.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellidos||''} - ${u.identificador||''}</option>`;
            });
        }
    } catch (err) { console.error('Error:', err); }
}

async function cargarSelectMateriales() {
    try {
        const res = await fetch('/api/articulo/disponibles');
        const data = await res.json();
        const container = document.getElementById('materialesCheckboxContainer');

        if (!container) {
            const select = document.getElementById('prestamoMaterial');
            if (!select) return;
            select.innerHTML = '<option value="">Seleccionar material...</option>';
            if (data.success) data.materiales.forEach(a => {
                select.innerHTML += `<option value="${a.id}">${a.nombre_material} (${a.nombre_disciplina||'Sin disc.'})</option>`;
            });
            return;
        }

        container.innerHTML = '';
        if (data.success && data.materiales.length > 0) {
            data.materiales.forEach(a => {
                const label = document.createElement('label');
                label.className = 'material-checkbox-item';
                label.innerHTML = `<input type="checkbox" name="material_ids" value="${a.id}"> <span>${a.nombre_material} <small style="color:#9ca3af;">(${a.nombre_disciplina||'Sin disc.'})</small></span>`;
                container.appendChild(label);
            });
        } else {
            container.innerHTML = '<p style="color:#9ca3af; padding:8px;">No hay materiales disponibles</p>';
        }
    } catch (err) { console.error('Error:', err); }
}

// ====== CREAR PRÉSTAMO ======
async function savePrestamo() {
    const usuario_id = document.getElementById('prestamoUsuario').value;
    const fecha_limite = document.getElementById('prestamoFechaLimite').value;
    const observaciones = document.getElementById('prestamoObservaciones').value;

    let material_ids = [];
    const cbs = document.querySelectorAll('input[name="material_ids"]:checked');
    if (cbs.length > 0) material_ids = Array.from(cbs).map(cb => parseInt(cb.value));
    else {
        const sel = document.getElementById('prestamoMaterial');
        if (sel && sel.value) material_ids = [parseInt(sel.value)];
    }

    if (!usuario_id || material_ids.length === 0 || !fecha_limite) {
        alert('⚠️ Completa todos los campos obligatorios'); return;
    }

    try {
        const res = await fetch('/api/prestamo', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, material_ids, fecha_limite, observaciones })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ ' + data.mensaje);
            document.getElementById('prestamoUsuario').value = '';
            document.getElementById('prestamoFechaLimite').value = '';
            document.getElementById('prestamoObservaciones').value = '';
            document.querySelectorAll('input[name="material_ids"]:checked').forEach(cb => cb.checked = false);
            const sel = document.getElementById('prestamoMaterial');
            if (sel) sel.value = '';
            toggleFormPrestamo();
            cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales();
        } else { alert('❌ ' + (data.message || data.error)); }
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== FINALIZAR ======
async function finalizarPrestamo(id) {
    const obs = prompt('Observaciones al finalizar (opcional):');
    if (obs === null) return;
    try {
        const res = await fetch(`/api/prestamo/${id}/finalizar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ observaciones: obs })
        });
        const data = await res.json();
        if (data.success) { alert('✅ ' + data.mensaje); cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales(); }
        else alert('❌ ' + data.error);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== RENOVAR ======
async function renovarPrestamo(id) {
    const dias = prompt('¿Cuántos días agregar?', '3');
    if (!dias || isNaN(dias) || parseInt(dias) < 1) return;
    try {
        const res = await fetch(`/api/prestamo/${id}/renovar`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dias: parseInt(dias) })
        });
        const data = await res.json();
        if (data.success) { alert('✅ ' + data.mensaje); cargarPrestamos(); cargarStatsPrestamos(); }
        else alert('❌ ' + (data.message || data.error));
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== SANCIONAR ======
async function sancionarDesdePrestamo(id) {
    const motivo = prompt('Motivo de la sanción:');
    if (!motivo) return;
    if (!confirm(`¿Sancionar al usuario?\nMotivo: ${motivo}`)) return;
    try {
        const res = await fetch(`/api/prestamo/${id}/sancionar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        const data = await res.json();
        if (data.success) { alert('✅ ' + data.mensaje); cargarPrestamos(); }
        else alert('❌ ' + data.error);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== ELIMINAR ======
async function eliminarPrestamo(id) {
    if (!confirm('¿Eliminar este préstamo?')) return;
    try {
        const res = await fetch(`/api/prestamo/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { alert('✅ ' + data.mensaje); cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales(); }
        else alert('❌ ' + data.error);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== FILTRAR ======
function filtrarPrestamos() {
    const q = document.getElementById('searchPrestamo').value.toLowerCase();
    const filtrados = prestamosData.filter(p => {
        return `${p.usuario_nombre} ${p.usuario_apellidos} ${p.usuario_matricula} ${p.materiales} ${p.estado_general} ${p.observaciones}`.toLowerCase().includes(q);
    });
    renderPrestamos(filtrados);
}

// ====== UTILIDADES ======
function getEstadoPillClass(estado) {
    const map = {
        'Pendiente': 'prestamo-pill-pendiente', 'Abierto': 'prestamo-pill-abierto', 'Activo': 'prestamo-pill-abierto',
        'Cerrado': 'prestamo-pill-cerrado', 'Finalizado': 'prestamo-pill-cerrado',
        'Entregado': 'prestamo-pill-entregado', 'Devuelto': 'prestamo-pill-entregado',
        'Retraso': 'prestamo-pill-retraso', 'Vencido': 'prestamo-pill-retraso',
        'Cancelado': 'prestamo-pill-cancelado', 'Denegado': 'prestamo-pill-cancelado',
        'Renovado': 'prestamo-pill-renovado'
    };
    return map[estado] || 'prestamo-pill-pendiente';
}

function formatFecha(fechaStr) {
    if (!fechaStr) return '<span style="color:#9ca3af;">—</span>';
    const f = new Date(fechaStr);
    const dia = f.getDate().toString().padStart(2,'0');
    const mes = (f.getMonth()+1).toString().padStart(2,'0');
    const hrs = f.getHours();
    const min = f.getMinutes().toString().padStart(2,'0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = (hrs % 12 || 12).toString().padStart(2,'0');
    return `${dia}/${mes}/${f.getFullYear()}<br><small style="color:#9ca3af;">${h12}:${min} ${ampm}</small>`;
}