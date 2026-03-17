// Datos Iniciales
let events = [
    { id: 1, title: 'Conferencia de Tecnología 2026', date: '28 Feb 2026', time: '10:00 AM', location: 'Auditorio Principal', attendees: 45 },
    { id: 2, title: 'Torneo de Fútbol Intercolegial', date: '5 Mar 2026', time: '3:00 PM', location: 'Cancha #1', attendees: 22 }
];

// Selectores
const overlay = document.getElementById('eventModalOverlay');
const eventList = document.getElementById('eventList');
const addForm = document.getElementById('addEventForm');

// Abrir/Cerrar Modal
document.getElementById('openModalBtn').addEventListener('click', () => {
    overlay.classList.remove('hidden');
    renderEvents();
});

function closeModal() {
    overlay.classList.add('hidden');
}

// Mostrar/Ocultar Formulario
document.getElementById('toggleFormBtn').addEventListener('click', () => toggleForm());

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