/* =========================================
   LÓGICA DEL CATÁLOGO - UTM
   ========================================= */

// 1. Referencias a elementos
const modal = document.getElementById('modalOverlay'); // ID actualizado al del HTML Glass
const btnAdd = document.querySelector('.btn-add');
const catalogTable = document.getElementById('catalogTable').getElementsByTagName('tbody')[0];

// 2. Abrir y Cerrar Modal
btnAdd.onclick = () => {
    // Limpiar campos antes de abrir
    document.querySelector('.modal-content h3').innerText = 'Nuevo Material';
    clearInputs();
    modal.classList.add('active');
};

function closeModal() {
    modal.classList.remove('active');
}

// Cerrar modal si se hace click fuera del contenido blanco
window.onclick = (event) => {
    if (event.target == modal) closeModal();
};

// 3. Lógica de Búsqueda (Filtrado en tiempo real)
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = catalogTable.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

// 4. Lógica de Eliminar
function deleteRow(button) {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
        const row = button.closest('tr');
        row.remove();
        updateStats(); 
    }
}

// 5. Guardar Nuevo Material (Insertar fila en la tabla)
function saveItem() {
    // Obtener valores de los inputs del modal
    const name = document.querySelector('.form-grid-modal input[type="text"]').value;
    const category = document.querySelector('.form-grid-modal select').value;
    const total = document.querySelector('.form-grid-modal input[type="number"]').value;

    if (!name || !category || !total) {
        alert('Por favor, completa todos los campos');
        return;
    }

    // Crear la nueva fila
    const newRow = catalogTable.insertRow();
    
    // Definir el color de la etiqueta (badge) según categoría
    const badgeClass = category.toLowerCase() === 'libro' ? 'badge-libro' : 'badge-deporte';

    newRow.innerHTML = `
        <td><strong>${name}</strong></td>
        <td><span class="badge ${badgeClass}">${category}</span></td>
        <td class="text-center">${total}</td>
        <td class="text-center text-green">${total}</td>
        <td class="text-center">
            <div class="actions">
                <button class="btn-icon edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon delete" onclick="deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
            </div>
        </td>
    `;

    updateStats();
    closeModal();
    clearInputs();
}

// 6. Actualizar estadísticas (Píldoras azules y verdes)
function updateStats() {
    const rows = catalogTable.querySelectorAll('tr');
    let totalItems = rows.length;
    let totalAvailable = 0;

    rows.forEach(row => {
        // Obtenemos el valor de la celda de "Disponible" (índice 3)
        const availText = row.cells[3].innerText;
        totalAvailable += parseInt(availText) || 0;
    });

    // Actualizamos los textos en el HTML
    document.getElementById('totalItems').innerText = totalItems;
    document.getElementById('totalAvailable').innerText = totalAvailable;
}

// Helper para limpiar formulario
function clearInputs() {
    document.querySelectorAll('.form-grid-modal input').forEach(i => i.value = '');
    document.querySelector('.form-grid-modal select').value = '';
}