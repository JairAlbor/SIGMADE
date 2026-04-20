// ======================== EVENTOS ========================
let eventsData = [];

const eventModalOverlayEl = document.getElementById('eventModalOverlay');
const eventList = document.getElementById('eventList');
const addForm = document.getElementById('addEventForm');

function openEvents() {
    if (eventModalOverlayEl) eventModalOverlayEl.classList.remove('hidden');
    cargarEventos();
}

function closeModal() {
    if (eventModalOverlayEl) eventModalOverlayEl.classList.add('hidden');
}

function toggleFormEventos(show = true) {
    if (show && addForm.classList.contains('hidden')) {
        addForm.classList.remove('hidden');
    } else {
        addForm.classList.add('hidden');
    }
}

async function cargarEventos() {
    try {
        const res = await fetch(`${API_BASE}/api/evento`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        const data = await res.json();
        if (data.success) {
            eventsData = data.eventos;
            renderEvents(eventsData);
            if (document.getElementById('eventosCounterModal')) document.getElementById('eventosCounterModal').textContent = data.eventos.length;
            if (document.getElementById('totalEventos')) document.getElementById('totalEventos').textContent = data.eventos.length;
        }
    } catch (err) { console.error('Error eventos:', err); }
}

function renderEvents(lista) {
    eventList.innerHTML = '';
    if (lista.length === 0) {
        eventList.innerHTML = '<p style="text-align:center; color:#9ca3af;">No hay eventos registrados</p>';
        return;
    }

    lista.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style = 'border:1px solid #e5e7eb; border-radius:8px; margin-bottom:15px; box-shadow:0 2px 4px rgba(0,0,0,0.05);';
        card.innerHTML = `
            <div style="display: flex; flex-direction:column; gap:6px; align-items: flex-start; padding: 15px;">
                <div style="font-weight:bold; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="calendar" style="width:18px;"></i> ${event.titulo}
                </div>
                <div style="color:#333; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="map-pin" style="width:18px;"></i> ${event.ubicacion}
                </div>
                <div style="color:#333; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="calendar-days" style="width:18px;"></i> ${event.fecha} a las ${event.hora_inicio}
                </div>
                <div style="color:#333; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="align-left" style="width:18px;"></i> ${event.descripcion || ''}
                </div>
                <button onclick="eliminarEvento(${event.id})" style="color:#ef4444; font-weight:bold; background:none; border:none; cursor:pointer; margin-top:10px; display:flex; align-items:center; gap:5px; padding:0;">
                    <i data-lucide="trash-2" style="width:16px;"></i> Eliminar
                </button>
            </div>
        `;
        eventList.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function saveEvent() {
    const titulo = document.getElementById('eventTitle').value;
    const ubicacion = document.getElementById('eventLocation').value;
    const fecha = document.getElementById('eventDate').value;
    const hora = '00:00';
    const hora_fin = '23:59';
    const descripcion = document.getElementById('eventDesc').value;

    if (!titulo || !fecha) {
        alert("Título y fecha son obligatorios."); return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/evento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
            body: JSON.stringify({ titulo, descripcion, fecha, hora, hora_fin, ubicacion })
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ Evento guardado');
            toggleFormEventos(false);

            // clear form
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventLocation').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventDesc').value = '';

            cargarEventos();
        } else alert('❌ ' + data.message);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

async function eliminarEvento(id) {
    if (!confirm("¿Deseas eliminar este evento?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/evento/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('Evento eliminado');
            cargarEventos();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) {
        console.error(err);
    }
}

// Removido Disciplinas y Entrenadores de aquí ya que se gestionan en app3.js para evitar colisiones.




// ======================== PRÉSTAMOS ========================
let prestamosData = [];
let currentPrestamosTab = 'encurso';

function openPrestamos() {
    document.getElementById('prestamoModalOverlay').classList.remove('hidden');
    cargarPrestamos();
    cargarStatsPrestamos();
    cargarSelectUsuarios();
    cargarSelectMateriales();
    switchPrestamosTab('encurso', document.getElementById('tabEnCurso'));
}

function closePrestamos() {
    document.getElementById('prestamoModalOverlay').classList.add('hidden');
}

function toggleFormPrestamo() {
    const form = document.getElementById('addPrestamoForm');
    form.classList.toggle('hidden');
    ocultarConflictos();
}

function switchPrestamosTab(tab, btn) {
    currentPrestamosTab = tab;

    // Update button styles
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(b => {
        b.style.color = '#6b7280';
        b.style.borderBottom = '2px solid transparent';
        b.style.fontWeight = 'normal';
    });
    if (btn) {
        btn.style.color = 'var(--guinda)';
        btn.style.borderBottom = '2px solid var(--guinda)';
        btn.style.fontWeight = 'bold';
    }

    // Update filter options based on tab
    const select = document.getElementById('filterStatus');
    if (tab === 'encurso') {
        select.innerHTML = `
          <option value="">Estados (Todos)</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Abierto">Abierto</option>
          <option value="Activo">Activo</option>
          <option value="Retraso">Vencido / Retraso</option>
        `;
    } else {
        select.innerHTML = `
          <option value="">Estados (Todos)</option>
          <option value="Cerrado">Cerrado / Finalizado</option>
          <option value="Entregado">Entregado / Devuelto</option>
          <option value="Cancelado">Cancelado / Rechazado</option>
        `;
    }

    aplicarFiltrosPrestamos();
}

// ====== CARGAR Y RENDERIZAR ======
async function cargarPrestamos() {
    try {
        const res = await fetch(`${API_BASE}/api/prestamo`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        const data = await res.json();
        if (data.success) {
            prestamosData = data.prestamos;
            aplicarFiltrosPrestamos();
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
        const pillClass = getEstadoPillClass(p.estado_general);
        const fechaSol = formatFecha(p.fecha_solicitud);
        const fechaLim = formatFecha(p.fecha_limite);
        const fechaEnt = p.fecha_entrega ? formatFecha(p.fecha_entrega) : '<span style="color:#9ca3af;">—</span>';
        const materiales = p.materiales || 'Sin material';

        // Badge de tipo de material (cancha vs deportivo)
        const tieneCancha = (p.materiales || '').toLowerCase().includes('cancha') ||
            (p.tipo_material || '').toLowerCase().includes('cancha');
        const tipoBadge = tieneCancha
            ? `<span class="badge-cancha"><i class="fa-solid fa-table-tennis-paddle-ball"></i> Cancha</span>`
            : `<span class="badge-material"><i class="fa-solid fa-box"></i> Material</span>`;

        const esPendiente = ['Pendiente'].includes(p.estado_general);
        const esActivo = ['Abierto', 'Activo', 'Renovado', 'Retraso', 'Vencido'].includes(p.estado_general);
        let acciones = '';

        if (esPendiente) {
            acciones = `
                <button class="btn-icon edit" title="Aceptar Préstamo" onclick="aceptarPrestamo(${p.id})" style="color:#16a34a;">
                    <i class="fa-solid fa-check-double"></i>
                </button>
                <button class="btn-icon delete" title="Rechazar Préstamo" onclick="rechazarPrestamo(${p.id})" style="color:#dc2626;">
                    <i class="fa-solid fa-ban"></i>
                </button>
            `;
        } else if (esActivo) {
            acciones = `
                <button class="btn-icon edit" title="Entregar/Finalizar" onclick="abrirFinalizarPrestamo(${p.id})" style="color:#16a34a;">
                    <i class="fa-solid fa-circle-check"></i>
                </button>
                <button class="btn-icon edit" title="Renovar" onclick="renovarPrestamo(${p.id})" style="color:#2563eb;">
                    <i class="fa-solid fa-rotate"></i>
                </button>
                <button class="btn-icon edit" title="Sancionar" onclick="sancionarDesdePrestamo(${p.id})" style="color:#d97706;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </button>`;
        } else {
            acciones = `
                <button class="btn-icon delete" title="Eliminar del registro" onclick="eliminarPrestamo(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td><div class="user-cell"><div class="user-cell-avatar"><i class="fa-solid fa-user"></i></div><div><span class="user-cell-name">${p.usuario_nombre} ${p.usuario_apellidos || ''}</span><span class="user-cell-id">${p.usuario_matricula || ''}</span></div></div></td>
            <td>
              <span class="material-tag">${materiales}</span>
              <div style="margin-top:4px;">${tipoBadge}</div>
            </td>
            <td>${fechaSol}</td>
            <td>${fechaLim}</td>
            <td><span class="status-pill ${pillClass}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${p.estado_general || 'N/A'}</span></td>
            <td>${fechaEnt}</td>
            <td><small>${p.observaciones || ''}</small></td>
            <td><div class="actions">${acciones}</div></td>`;
        tbody.appendChild(row);
    });

    document.getElementById('prestamoCounter').textContent = `Mostrando ${prestamos.length} préstamo(s)`;
}

// ====== KPIs ======
async function cargarStatsPrestamos() {
    try {
        const res = await fetch(`${API_BASE}/api/prestamo/stats`);
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
        const res = await fetch(`${API_BASE}/api/usuario`);
        const data = await res.json();
        const select = document.getElementById('prestamoUsuario');
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';
        if (data.success) {
            data.usuarios.filter(u => u.estatus === 'Activo').forEach(u => {
                select.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellidos || ''} - ${u.identificador || ''}</option>`;
            });
        }
    } catch (err) { console.error('Error:', err); }
}

async function cargarSelectMateriales() {
    try {
        const res = await fetch(`${API_BASE}/api/articulo/disponibles`);
        const data = await res.json();
        const container = document.getElementById('materialesCheckboxContainer');

        if (!container) {
            const select = document.getElementById('prestamoMaterial');
            if (!select) return;
            select.innerHTML = '<option value="">Seleccionar material...</option>';
            if (data.success) data.materiales.forEach(a => {
                select.innerHTML += `<option value="${a.id}">${a.nombre_material} (${a.nombre_disciplina || 'Sin disc.'})</option>`;
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
    const lista = document.getElementById('conflictosLista');
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
                <i class="fa-solid fa-calendar-xmark" style="color:#d97706;"></i> Reservado hasta: <strong>${new Date(c.reservado_hasta).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
            </span>
        </li>`).join('');
    alertDiv.classList.remove('hidden');
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function savePrestamo() {
    const usuario_id = document.getElementById('prestamoUsuario').value;
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
        const res = await fetch(`${API_BASE}/api/prestamo`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
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
        success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
        error: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
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

// ====== ACCIONES CONDICIONALES ======
async function aceptarPrestamo(id) {
    if (!confirm('¿Aceptar este préstamo e iniciar el periodo?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/prestamo/${id}/estatus`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
            body: JSON.stringify({ estatus: 'Activo' })
        });
        const data = await res.json();
        if (data.success) { alert('✅ Préstamo aceptado.'); cargarPrestamos(); cargarStatsPrestamos(); }
        else alert('❌ ' + data.message);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

async function rechazarPrestamo(id) {
    if (!confirm('¿Rechazar este préstamo?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/prestamo/${id}/estatus`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
            body: JSON.stringify({ estatus: 'Cancelado' })
        });
        const data = await res.json();
        if (data.success) { alert('✅ Préstamo rechazado.'); cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales(); }
        else alert('❌ ' + data.message);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

function abrirFinalizarPrestamo(id) {
    document.getElementById('finPrestamoId').value = id;
    document.getElementById('finPrestamoObs').value = '';
    document.getElementById('finalizarPrestamoModalOverlay').classList.remove('hidden');
}

async function confirmarFinalizarPrestamo() {
    const id = document.getElementById('finPrestamoId').value;
    const obs = document.getElementById('finPrestamoObs').value;

    try {
        const res = await fetch(`${API_BASE}/api/prestamo/${id}/finalizar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
            body: JSON.stringify({ observaciones: obs })
        });
        const data = await res.json();
        if (data.success) {
            mostrarToastAdmin('✅ Material entregado correctamente.', 'success');
            document.getElementById('finalizarPrestamoModalOverlay').classList.add('hidden');
            cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales();
        }
        else alert('❌ ' + data.error);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== RENOVAR ======
async function renovarPrestamo(id) {
    const dias = prompt('¿Cuántos días agregar?', '3');
    if (!dias || isNaN(dias) || parseInt(dias) < 1) return;
    try {
        const res = await fetch(`${API_BASE}/api/prestamo/${id}/renovar`, {
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
        const res = await fetch(`${API_BASE}/api/prestamo/${id}/sancionar`, {
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
        const res = await fetch(`${API_BASE}/api/prestamo/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { alert('✅ ' + data.mensaje); cargarPrestamos(); cargarStatsPrestamos(); cargarSelectMateriales(); }
        else alert('❌ ' + data.error);
    } catch (err) { alert('❌ Error: ' + err.message); }
}

// ====== FILTRAR Y TABS ======
function aplicarFiltrosPrestamos() {
    const q = document.getElementById('searchPrestamo').value.toLowerCase();
    const fStart = document.getElementById('filterDateStart').value;
    const fEnd = document.getElementById('filterDateEnd').value;
    const status = document.getElementById('filterStatus').value;

    let filtrados = prestamosData.filter(p => {
        // Tab filter
        let showInTab = false;
        const state = p.estado_general || '';
        if (currentPrestamosTab === 'encurso') {
            showInTab = ['Pendiente', 'Abierto', 'Activo', 'Retraso', 'Vencido', 'Renovado'].includes(state);
        } else {
            showInTab = ['Cerrado', 'Finalizado', 'Entregado', 'Devuelto', 'Cancelado', 'Denegado'].includes(state);
        }
        if (!showInTab) return false;

        // Search text
        if (q && !`${p.usuario_nombre} ${p.usuario_apellidos} ${p.usuario_matricula} ${p.materiales} ${p.estado_general} ${p.observaciones}`.toLowerCase().includes(q)) {
            return false;
        }

        // Status specific
        if (status && state !== status) return false;

        // Date range
        if (fStart || fEnd) {
            const reqDate = new Date(p.fecha_solicitud);
            if (fStart && reqDate < new Date(fStart + 'T00:00:00')) return false;
            if (fEnd && reqDate > new Date(fEnd + 'T23:59:59')) return false;
        }

        return true;
    });

    renderPrestamos(filtrados);
}

function limpiarFiltrosPrestamos() {
    document.getElementById('searchPrestamo').value = '';
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    document.getElementById('filterStatus').value = '';
    aplicarFiltrosPrestamos();
}

// ====== Generador PDF ======
function descargarPDFPrestamos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setFontSize(18);
    doc.text('Reporte de Préstamos - SIGMADE', 14, 22);
    doc.setFontSize(11);
    doc.text('Generado: ' + new Date().toLocaleString(), 14, 30);

    const rows = [];
    // Only get visible rows from table
    const tableRows = document.querySelectorAll('#tablaPrestamosBody tr');

    if (tableRows.length === 0 || tableRows[0].cells.length === 1) {
        alert("No hay datos para exportar"); return;
    }

    tableRows.forEach(tr => {
        if (tr.cells.length > 2) {
            rows.push([
                tr.cells[0].innerText, // ID
                tr.cells[1].innerText.replace(/\n/g, ' '), // Usuario
                tr.cells[2].innerText.replace(/\n/g, ' '), // Materiales
                tr.cells[3].innerText.replace(/\n/g, ' '), // Fecha Sol
                tr.cells[4].innerText.replace(/\n/g, ' '), // Fecha Lim
                tr.cells[5].innerText.replace(/\n/g, ' '), // Estado
                tr.cells[6].innerText.replace(/\n/g, ' ')  // Entrega
            ]);
        }
    });

    doc.autoTable({
        startY: 35,
        head: [['ID', 'Usuario', 'Material(es)', 'F. Solicitud', 'F. Límite', 'Estado', 'Entrega']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [128, 0, 0] }, // Guinda
        styles: { fontSize: 8 }
    });

    doc.save('Reporte_Prestamos_' + Date.now() + '.pdf');
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
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const hrs = f.getHours();
    const min = f.getMinutes().toString().padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = (hrs % 12 || 12).toString().padStart(2, '0');
    return `${dia}/${mes}/${f.getFullYear()}<br><small style="color:#9ca3af;">${h12}:${min} ${ampm}</small>`;
}

// Auto-inicializar estadísticas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarStatsPrestamos();
    // Cargar también disciplinas y entrenadores si es necesario para el dashboard principal
    if (typeof contarTotalDisciplinas === 'function') contarTotalDisciplinas();
    if (typeof contarTotalEntrenadores === 'function') contarTotalEntrenadores();
});
