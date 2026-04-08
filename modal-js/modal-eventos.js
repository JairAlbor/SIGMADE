// Datos Iniciales
let events = [
    { id: 1, title: 'Conferencia de Tecnología 2026', date: '28 Feb 2026', time: '10:00 AM', location: 'Auditorio Principal', attendees: 45 },
    { id: 2, title: 'Torneo de Fútbol Intercolegial', date: '5 Mar 2026', time: '3:00 PM', location: 'Cancha #1', attendees: 22 }
];

// Selectores
const overlay = document.getElementById('eventModalOverlay');
const eventList = document.getElementById('eventList');
const addForm = document.getElementById('addEventForm');

// Abrir modal de Eventos (llamado desde tarjeta "Eventos" en el panel)
function openEvents() {
    overlay.classList.remove('hidden');
    renderEvents();
}

// Cerrar modal de Eventos
function closeModal() {
    overlay.classList.add('hidden');
}

function toggleForm(show = true) {
    if (show && addForm.classList.contains('hidden')) {
        addForm.classList.remove('hidden');
    } else {
        addForm.classList.add('hidden');
    }
}

// Renderizar Lista
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
                <button class="text-red-600" onclick="deleteEvent(${event.id})" style="border:none; background:none; cursor:pointer; color:red;">
                    🗑️
                </button>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-close-footer" style="background: white; color: #374151; border: 1px solid #d1d5db;">Ver detalles</button>
                <button class="btn-register">Lista de asistentes</button>
            </div>
        `;
        eventList.appendChild(card);
    });
    lucide.createIcons(); // Refrescar iconos si usas la librería
}

function deleteEvent(id) {
    if (confirm('¿Estás seguro de dar de baja este evento?')) {
        events = events.filter(e => e.id !== id);
        renderEvents();
    }
}

function saveEvent() {
    // Aquí agregarías la lógica para capturar los inputs y hacer el push al array
    alert('Evento guardado (simulado)');
    toggleForm(false);
}


////////////////////////modal para disciplina deportiva////////////////////////
function openDisciplines() {
    document.getElementById('disciplineModalOverlay').classList.remove('hidden');
    renderDisciplines();
}

function closeDisciplines() {
    document.getElementById('disciplineModalOverlay').classList.add('hidden');
}

function toggleForm() {
    const form = document.getElementById('disciplineForm');
    form.classList.toggle('hidden');
}

function renderDisciplines() {
    const disciplines = [
        { id: 1, name: 'Fútbol', members: 45, trainer: 'Carlos López' },
        { id: 2, name: 'Básquetbol', members: 32, trainer: 'Ana Martínez' },
        { id: 3, name: 'Voleibol', members: 28, trainer: 'Roberto Díaz' }
    ];

    const grid = document.getElementById('disciplineGrid');
    grid.innerHTML = '';

    disciplines.forEach(d => {
        grid.innerHTML += `
            <div class="discipline-card" style="border: 1px solid #eee; padding: 15px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <h4 style="margin:0; color:#333;">${d.name}</h4>
                        <p style="font-size: 0.85rem; color:#666; margin: 5px 0;">Entrenador: ${d.trainer}</p>
                        <small style="color:#999;">${d.members} miembros</small>
                    </div>
                    <div style="color: #6d2d3b;">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <i class="fa-solid fa-trash" style="margin-left: 10px; color: #dc2626;"></i>
                    </div>
                </div>
            </div>
        `;
    });
}

///Modal para registro de prestamo de material deportivo////

// Variable para almacenar los préstamos cargados (para filtro)
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

// ====== CARGAR Y RENDERIZAR PRÉSTAMOS ======
async function cargarPrestamos() {
    try {
        const res = await fetch('/api/prestamo');
        const data = await res.json();

        if (data.success) {
            prestamosData = data.prestamos;
            renderPrestamos(prestamosData);
        } else {
            console.error('Error al cargar préstamos:', data.error);
        }
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}

function renderPrestamos(prestamos) {
    const tbody = document.getElementById('tablaPrestamosBody');
    tbody.innerHTML = '';

    if (prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding: 2rem; color: #9ca3af;">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; display:block; margin-bottom: 8px;"></i>
                    No hay préstamos registrados
                </td>
            </tr>`;
        document.getElementById('prestamoCounter').textContent = '';
        return;
    }

    prestamos.forEach(p => {
        const estadoPillClass = getEstadoPillClass(p.estado_general);
        const devolucionPillClass = getDevolucionPillClass(p.estado_devolucion);
        const fechaSolicitud = formatFecha(p.fecha_solicitud);
        const fechaLimite = formatFecha(p.fecha_limite);
        const fechaEntrega = p.fecha_entrega_real ? formatFecha(p.fecha_entrega_real) : '<span style="color:#9ca3af;">—</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td>
                <div class="user-cell">
                    <div class="user-cell-avatar"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <span class="user-cell-name">${p.usuario_nombre} ${p.usuario_apellidos || ''}</span>
                        <span class="user-cell-id">${p.usuario_matricula || ''}</span>
                    </div>
                </div>
            </td>
            <td><span class="material-tag">${p.material_nombre || 'Sin material'}</span></td>
            <td>${fechaSolicitud}</td>
            <td>${fechaLimite}</td>
            <td><span class="status-pill ${estadoPillClass}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${p.estado_general || 'N/A'}</span></td>
            <td><span class="status-pill ${devolucionPillClass}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${p.estado_devolucion || 'N/A'}</span></td>
            <td>${fechaEntrega}</td>
            <td><small>${p.observaciones || ''}</small></td>
            <td>
                <div class="actions">
                    <button class="btn-icon edit" title="Editar" onclick="editarPrestamo(${p.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon delete" title="Eliminar" onclick="eliminarPrestamo(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('prestamoCounter').textContent = `Mostrando ${prestamos.length} préstamo(s)`;
}

// ====== CARGAR KPIs ======
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
    } catch (err) {
        console.error('Error stats:', err);
    }
}

// ====== CARGAR SELECT DINÁMICOS ======
async function cargarSelectUsuarios() {
    try {
        const res = await fetch('/api/usuario');
        const data = await res.json();
        const select = document.getElementById('prestamoUsuario');

        // Guardar selección actual
        const currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';

        if (data.success) {
            data.usuarios.forEach(u => {
                select.innerHTML += `<option value="${u.id}">${u.nombre} ${u.apellidos || ''} - ${u.identificador || ''}</option>`;
            });
        }
        select.value = currentVal;
    } catch (err) {
        console.error('Error cargando usuarios:', err);
    }
}

async function cargarSelectMateriales() {
    try {
        const res = await fetch('/api/consultar/articulo');
        const data = await res.json();
        const select = document.getElementById('prestamoMaterial');

        const currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar material...</option>';

        if (data.success) {
            data.articulos.forEach(a => {
                const disponible = a.disponible === 'Libre';
                select.innerHTML += `<option value="${a.id}" ${!disponible ? 'disabled' : ''}>${a.nombre_material} (${a.nombre_disciplina}) ${!disponible ? '— Ocupado' : ''}</option>`;
            });
        }
        select.value = currentVal;
    } catch (err) {
        console.error('Error cargando materiales:', err);
    }
}

// ====== CREAR PRÉSTAMO ======
async function savePrestamo() {
    const usuario_id = document.getElementById('prestamoUsuario').value;
    const material_id = document.getElementById('prestamoMaterial').value;
    const fecha_limite = document.getElementById('prestamoFechaLimite').value;
    const observaciones = document.getElementById('prestamoObservaciones').value;

    if (!usuario_id || !material_id || !fecha_limite) {
        alert('⚠️ Por favor completa todos los campos obligatorios (Usuario, Material, Fecha Límite)');
        return;
    }

    try {
        const res = await fetch('/api/prestamo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, material_id, fecha_limite, observaciones })
        });

        const data = await res.json();

        if (data.success) {
            alert('✅ ' + data.mensaje);
            // Limpiar formulario
            document.getElementById('prestamoUsuario').value = '';
            document.getElementById('prestamoMaterial').value = '';
            document.getElementById('prestamoFechaLimite').value = '';
            document.getElementById('prestamoObservaciones').value = '';
            toggleFormPrestamo();

            // Recargar todo
            cargarPrestamos();
            cargarStatsPrestamos();
            cargarSelectMateriales();
        } else {
            alert('❌ Error: ' + (data.message || data.error));
        }
    } catch (err) {
        alert('❌ Error de conexión: ' + err.message);
    }
}

// ====== ELIMINAR PRÉSTAMO ======
async function eliminarPrestamo(id) {
    if (!confirm('¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch(`/api/prestamo/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            alert('✅ ' + data.mensaje);
            cargarPrestamos();
            cargarStatsPrestamos();
            cargarSelectMateriales();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (err) {
        alert('❌ Error de conexión: ' + err.message);
    }
}

// ====== EDITAR PRÉSTAMO ======
async function editarPrestamo(id) {
    const prestamo = prestamosData.find(p => p.id === id);
    if (!prestamo) return;

    const nuevoEstado = prompt(
        `Estado actual: ${prestamo.estado_general}\n\nEscribe el nuevo estado general:\n• Abierto\n• Cerrado\n• Retraso\n• Cancelado`,
        prestamo.estado_general
    );
    if (!nuevoEstado) return;

    const nuevaDevolucion = prompt(
        `Estado devolución actual: ${prestamo.estado_devolucion || 'Pendiente'}\n\nEscribe el nuevo estado:\n• Pendiente\n• Entregado\n• Dañado\n• Perdido`,
        prestamo.estado_devolucion || 'Pendiente'
    );
    if (!nuevaDevolucion) return;

    const observaciones = prompt('Observaciones:', prestamo.observaciones || '');

    // Si marca como entregado, poner fecha actual
    let fecha_entrega_real = null;
    if (nuevaDevolucion === 'Entregado') {
        fecha_entrega_real = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    try {
        const res = await fetch(`/api/prestamo/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado_general: nuevoEstado,
                estado_devolucion: nuevaDevolucion,
                fecha_entrega_real: fecha_entrega_real,
                observaciones: observaciones
            })
        });

        const data = await res.json();

        if (data.success) {
            alert('✅ ' + data.mensaje);
            cargarPrestamos();
            cargarStatsPrestamos();
            cargarSelectMateriales();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (err) {
        alert('❌ Error de conexión: ' + err.message);
    }
}

// ====== FILTRAR PRÉSTAMOS ======
function filtrarPrestamos() {
    const query = document.getElementById('searchPrestamo').value.toLowerCase();

    const filtrados = prestamosData.filter(p => {
        const texto = `${p.usuario_nombre} ${p.usuario_apellidos} ${p.usuario_matricula} ${p.material_nombre} ${p.estado_general} ${p.estado_devolucion} ${p.observaciones}`.toLowerCase();
        return texto.includes(query);
    });

    renderPrestamos(filtrados);
}

// ====== UTILIDADES DE FORMATO ======
function getEstadoPillClass(estado) {
    const map = {
        'Abierto': 'prestamo-pill-abierto',
        'Cerrado': 'prestamo-pill-cerrado',
        'Retraso': 'prestamo-pill-retraso',
        'Cancelado': 'prestamo-pill-cancelado',
        'Pendiente': 'prestamo-pill-pendiente'
    };
    return map[estado] || 'prestamo-pill-pendiente';
}

function getDevolucionPillClass(estado) {
    const map = {
        'Pendiente': 'prestamo-pill-pendiente',
        'Entregado': 'prestamo-pill-entregado',
        'Dañado': 'prestamo-pill-danado',
        'Perdido': 'prestamo-pill-perdido'
    };
    return map[estado] || 'prestamo-pill-pendiente';
}

function formatFecha(fechaStr) {
    if (!fechaStr) return '<span style="color:#9ca3af;">—</span>';
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    const hora12 = (horas % 12 || 12).toString().padStart(2, '0');
    return `${dia}/${mes}/${anio}<br><small style="color:#9ca3af;">${hora12}:${minutos} ${ampm}</small>`;
}