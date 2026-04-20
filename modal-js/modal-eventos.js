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
        const res = await fetch('/api/disciplina', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
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
        const res = await fetch('/api/entrenador', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
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
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify({ nombre, entrenador_id: entrenador_id || null })
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ ' + data.mensaje);
            document.getElementById('disciplinaNombre').value = '';
            toggleDisciplineForm();
            cargarDisciplinas();
            if (typeof contarTotalDisciplinas === 'function') contarTotalDisciplinas();
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
        const res = await fetch(`/api/disciplina/${id}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ ' + data.mensaje);
            cargarDisciplinas();
            if (typeof contarTotalDisciplinas === 'function') contarTotalDisciplinas();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}


async function contarTotalDisciplinas() {
  try {
    const response = await fetch('/api/disciplina', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    });
    const data = await response.json();
    
    // Verificamos que la consulta haya sido exitosa
    if (data.success) {
      const elementoTarjeta = document.getElementById('totalDisciplinas');
      if (elementoTarjeta) {
        // Obtenemos la cantidad de elementos en el arreglo (array) y lo mostramos
        elementoTarjeta.textContent = data.disciplinas.length;
      }
    }
  } catch (err) {
    console.error('Error al intentar contabilizar disciplinas:', err);
  }
}

// ======================== ENTRENADORES ========================
function openEntrenadores() {
    const modal = document.getElementById('trainerModalOverlay');
    if (modal) {
        modal.classList.remove('hidden');
        renderEntrenadores();
    } else {
        console.error("❌ Modal 'trainerModalOverlay' no encontrado");
    }
}

function closeEntrenadores() {
    const modal = document.getElementById('trainerModalOverlay');
    if (modal) modal.classList.add('hidden');
}

async function renderEntrenadores() {
    try {
        const res = await fetch('/api/entrenador', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        const data = await res.json();
        const grid = document.getElementById('trainerGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        if (data.success && data.entrenadores.length > 0) {
            data.entrenadores.forEach(e => {
                grid.innerHTML += `
                    <div class="trainer-card" style="background: white; border: 1px solid #e5e7eb; padding: 1.25rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="background: #f3f4f6; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                                <i class="fa-solid fa-user-tie" style="font-size: 1.5rem;"></i>
                            </div>
                            <div style="flex: 1;">
                                <h4 style="margin: 0; color: #111827; font-size: 1rem;">${e.nombre} ${e.apellidos}</h4>
                                <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">${e.email}</p>
                            </div>
                            <div class="status-pill ${e.estatus === 'Activo' ? 'active' : 'inactive'}" style="font-size: 0.75rem;">
                                ${e.estatus}
                            </div>
                        </div>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; display: flex; gap: 1rem;">
                            <span style="font-size: 0.85rem; color: #4b5563;">
                                <i class="fa-solid fa-phone" style="margin-right: 4px; color: #9ca3af;"></i> ${e.telefono || 'Sin tel.'}
                            </span>
                        </div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = '<p style="text-align:center; color:#9ca3af; padding:20px;">No hay entrenadores registrados</p>';
        }
    } catch (err) {
        console.error('Error al renderizar entrenadores:', err);
    }
}

async function contarTotalEntrenadores() {
    try {
        const res = await fetch('/api/entrenador', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        const data = await res.json();
        if (data.success) {
            const el = document.getElementById('totalEntrenadores');
            if (el) el.textContent = data.entrenadores.length;
        }
    } catch (err) {
        console.error('Error al contar entrenadores:', err);
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

    // Auto-poblar fecha de solicitud al abrir el formulario
    if (!form.classList.contains('hidden')) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const dateStr = now.toISOString().slice(0, 16);
        const elSol = document.getElementById('prestamoFechaSolicitud');
        if (elSol) elSol.value = dateStr;
    }

    // Limpiar alert de conflictos al abrir/cerrar
    ocultarConflictos();
}

// ====== CARGAR Y RENDERIZAR ======
async function cargarPrestamos() {
    try {
        const res = await fetch('/api/prestamo', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
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
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2.5rem; color:#9ca3af;">
            <i class="fa-solid fa-inbox" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
            No hay préstamos registrados</td></tr>`;
        document.getElementById('prestamoCounter').textContent = '';
        return;
    }

    prestamos.forEach(p => {
        const pillClass  = getEstadoPillClass(p.estado_general);
        const fechaSol   = formatFecha(p.fecha_solicitud);
        const fechaLim   = formatFecha(p.fecha_limite);
        const fechaEnt   = p.fecha_entrega ? formatFecha(p.fecha_entrega) : '<span style="color:#9ca3af;">—</span>';
        const materiales = p.materiales || 'Sin material';

        // Badge de tipo de material (cancha vs deportivo)
        const tieneCancha = (p.materiales || '').toLowerCase().includes('cancha') ||
                            (p.tipo_material || '').toLowerCase().includes('cancha');
        const tipoBadge   = tieneCancha
            ? `<span class="badge-cancha"><i class="fa-solid fa-table-tennis-paddle-ball"></i> Cancha</span>`
            : `<span class="badge-material"><i class="fa-solid fa-box"></i> Material</span>`;

        const esActivo = ['Abierto','Activo','Renovado','Pendiente'].includes(p.estado_general);
        let acciones = '';
        if (esActivo) {
            acciones = `
                <button class="btn-icon edit" title="Finalizar" onclick="finalizarPrestamo(${p.id})" style="color:#16a34a;">
                    <i class="fa-solid fa-circle-check"></i>
                </button>
                <button class="btn-icon edit" title="Renovar" onclick="renovarPrestamo(${p.id})" style="color:#2563eb;">
                    <i class="fa-solid fa-rotate"></i>
                </button>
                <button class="btn-icon edit" title="Sancionar" onclick="sancionarDesdePrestamo(${p.id})" style="color:#d97706;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </button>
                <button class="btn-icon delete" title="Eliminar" onclick="eliminarPrestamo(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>`;
        } else {
            acciones = `<button class="btn-icon delete" title="Eliminar" onclick="eliminarPrestamo(${p.id})">
                <i class="fa-solid fa-trash"></i></button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td><div class="user-cell"><div class="user-cell-avatar"><i class="fa-solid fa-user"></i></div><div><span class="user-cell-name">${p.usuario_nombre} ${p.usuario_apellidos||''}</span><span class="user-cell-id">${p.usuario_matricula||''}</span></div></div></td>
            <td>
              <span class="material-tag">${materiales}</span>
              <div style="margin-top:4px;">${tipoBadge}</div>
            </td>
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
        const res = await fetch('/api/prestamo/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        const data = await res.json();
        if (data.success) {
            // Stats dentro del modal de gestión
            if (document.getElementById('prestamosAbiertos')) document.getElementById('prestamosAbiertos').textContent = data.abiertos;
            if (document.getElementById('prestamosVencidos')) document.getElementById('prestamosVencidos').textContent = data.retraso;
            if (document.getElementById('prestamosCerrados')) document.getElementById('prestamosCerrados').textContent = data.cerrados;
            if (document.getElementById('prestamosTotal')) document.getElementById('prestamosTotal').textContent = data.total;

            // Stats del Dashboard principal (Tarjetas azules)
            if (document.getElementById('cardPrestamosActivos')) document.getElementById('cardPrestamosActivos').textContent = data.abiertos;
            if (document.getElementById('cardVencenHoy')) document.getElementById('cardVencenHoy').textContent = data.vencen_hoy;
            if (document.getElementById('cardVencidos')) document.getElementById('cardVencidos').textContent = data.retraso;
        }
    } catch (err) { console.error('Error stats:', err); }
}

// ====== SELECTS DINÁMICOS ======
async function cargarSelectUsuarios() {
    try {
        const res = await fetch('/api/usuario', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
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
        const res = await fetch('/api/articulo/disponibles', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
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
                // Determinar icono
                let icon = 'fa-box-open';
                const nombre = a.nombre_material.toLowerCase();
                if (nombre.includes('balon') || nombre.includes('pelota')) icon = 'fa-volleyball';
                if (nombre.includes('casaca') || nombre.includes('chaleco')) icon = 'fa-shirt';
                if (nombre.includes('cono')) icon = 'fa-triangle-exclamation';
                if (nombre.includes('red')) icon = 'fa-border-all';

                const row = document.createElement('div');
                row.className = 'material-qty-card';
                row.innerHTML = `
                    <div class="mat-card-info" style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #eff6ff; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3b82f6;">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <div>
                            <strong>${a.nombre_material}</strong>
                            <small>${a.nombre_disciplina || 'General'}</small>
                        </div>
                    </div>
                    <div class="mat-card-controls">
                        <input type="number" class="mat-qty-input" 
                            data-ids="${a.ids_disponibles}" 
                            value="0" min="0" max="${a.cantidad_disponible}">
                        <span class="mat-qty-max">/ ${a.cantidad_disponible}</span>
                    </div>
                `;
                container.appendChild(row);
            });
        } else {
            container.innerHTML = '<p style="color:#9ca3af; padding:12px; text-align:center;">No hay materiales disponibles</p>';
        }
    } catch (err) { console.error('Error:', err); }
}

// ====== CREAR PRÉSTAMO ======
function ocultarConflictos() {
    const alert = document.getElementById('conflictosAlert');
    if (alert) alert.classList.add('hidden');
    const lista = document.getElementById('conflictosLista');
    if (lista) lista.innerHTML = '';
}

function mostrarConflictos(conflictos) {
    const alertDiv = document.getElementById('conflictosAlert');
    const lista    = document.getElementById('conflictosLista');
    if (!alertDiv || !lista) {
        // fallback: alert nativo
        alert('⚠️ Conflicto de reserva:\n' + conflictos.map(c =>
            `• ${c.material} (${c.tipo}) \u2014 reservado hasta ${new Date(c.reservado_hasta).toLocaleString('es-MX')} por ${c.reservado_por}`
        ).join('\n'));
        return;
    }
    lista.innerHTML = conflictos.map(c => `
        <li class="conflicto-item">
            <strong>${c.material}</strong>
            <span style="background:#fef3c7; color:#92400e; padding:1px 7px; border-radius:8px; font-size:0.78rem; margin-left:6px;">${c.tipo}</span><br>
            <span style="font-size:0.82rem;">
                <i class="fa-solid fa-user" style="color:#d97706;"></i> ${c.reservado_por} &nbsp;—&nbsp;
                <i class="fa-solid fa-calendar-xmark" style="color:#d97706;"></i> Reservado hasta: <strong>${new Date(c.reservado_hasta).toLocaleString('es-MX', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</strong>
            </span>
        </li>`).join('');
    alertDiv.classList.remove('hidden');
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function savePrestamo() {
    const usuario_id   = document.getElementById('prestamoUsuario').value;
    const fecha_limite = document.getElementById('prestamoFechaLimite').value;
    const observaciones = document.getElementById('prestamoObservaciones').value;

    let material_ids = [];
    const matInputs = document.querySelectorAll('.mat-qty-input');
    matInputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const allIds = input.getAttribute('data-ids').split(',');
            // Tomamos los primeros N IDs disponibles según la cantidad elegida
            const selectedIds = allIds.slice(0, qty).map(id => parseInt(id));
            material_ids.push(...selectedIds);
        }
    });

    if (!usuario_id || material_ids.length === 0 || !fecha_limite) {
        alert('⚠️ Completa todos los campos obligatorios'); return;
    }

    // Limpiar conflictos previos
    ocultarConflictos();

    try {
        const res  = await fetch('/api/prestamo', {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify({ usuario_id, material_ids, fecha_limite, observaciones })
        });
        const data = await res.json();

        if (data.success) {
            // Limpiar formulario
            document.getElementById('prestamoUsuario').value = '';
            document.getElementById('prestamoFechaLimite').value = '';
            document.getElementById('prestamoObservaciones').value = '';
            document.querySelectorAll('input[name="material_ids"]:checked').forEach(cb => cb.checked = false);
            const sel = document.getElementById('prestamoMaterial');
            if (sel) sel.value = '';
            toggleFormPrestamo();
            cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales();
            // Toast de éxito
            mostrarToastAdmin('✅ Préstamo registrado correctamente.', 'success');
        } else if (data.conflicto && data.conflictos?.length > 0) {
            // Mostrar alerta visual de conflictos
            mostrarConflictos(data.conflictos);
        } else {
            alert('❌ ' + (data.message || data.error));
        }
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// Toast para admin panel
function mostrarToastAdmin(mensaje, tipo) {
    const colors = {
        success: { bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d' },
        error:   { bg:'#fef2f2', border:'#fecaca', color:'#dc2626' },
    };
    const c = colors[tipo] || colors.success;
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background:${c.bg}; border:1px solid ${c.border}; color:${c.color};
        padding:12px 18px; border-radius:10px; font-size:0.9rem; font-weight:500;
        box-shadow:0 4px 12px rgba(0,0,0,0.10); animation:alertSlideDown 0.3s ease-out; max-width:340px;`;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ====== FINALIZAR ======
async function finalizarPrestamo(id) {
    const obs = prompt('Observaciones al finalizar (opcional):');
    if (obs === null) return;
    try {
        const res = await fetch(`/api/prestamo/${id}/finalizar`, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
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
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
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
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
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
        const res = await fetch(`/api/prestamo/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
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

// Auto-inicializar estadísticas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarStatsPrestamos();
    // Cargar también disciplinas y entrenadores si es necesario para el dashboard principal
    if (typeof contarTotalDisciplinas === 'function') contarTotalDisciplinas();
    if (typeof contarTotalEntrenadores === 'function') contarTotalEntrenadores();
});