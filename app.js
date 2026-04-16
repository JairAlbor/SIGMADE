// ============================================================
//  SIGMADE – app.js
//  Catálogo de Material: CRUD + visibilidad por rol
// ============================================================

const apiLogin = "http://localhost:3001/api/login";

// ────────────────────────────────────────────────────────────
//  INICIO
// ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('tabla-cuerpo')) {
        cargarArticulos();
        contarTotalMateriales();
        contarDisponibles();
        cargarDisciplinasSelect();   // Carga dinámicamente el select de disciplinas
        aplicarVisibilidadPorRol();  // Muestra/oculta controles según rol
        activarBuscador();           // Búsqueda en tiempo real
    }
    if (document.getElementById('totalUser')) {
        contarTotalUsuarios();
    }
});


// ────────────────────────────────────────────────────────────
//  ROL – Ocultar botones de admin para usuarios normales
// ────────────────────────────────────────────────────────────
function aplicarVisibilidadPorRol() {
    const info = JSON.parse(localStorage.getItem('usuarioInfo') || '{}');
    const esAdmin = info.rol === 'Admin' || info.rol === 'Operador';

    const btnAgregar   = document.getElementById('btn-abrir-formulario');
    const formCard     = document.getElementById('contenedor-formulario');
    const banner       = document.getElementById('bannerSoloLectura');
    const thAcciones   = document.getElementById('th-acciones');

    if (!esAdmin) {
        if (btnAgregar) btnAgregar.classList.add('hidden');
        if (formCard)   formCard.classList.add('hidden');
        if (banner)     banner.classList.remove('hidden');
        if (thAcciones) thAcciones.classList.add('hidden');
    }
}

// ────────────────────────────────────────────────────────────
//  DISCIPLINAS – Select dinámico del formulario
// ────────────────────────────────────────────────────────────
async function cargarDisciplinasSelect() {
    try {
        const res  = await fetch('/api/disciplina');
        const data = await res.json();
        const sel  = document.getElementById('disciplina');
        if (!sel || !data.success) return;
        sel.innerHTML = '<option value="">Seleccionar disciplina…</option>';
        data.disciplinas.forEach(d => {
            sel.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
        });
    } catch (e) {
        console.error('Error cargando disciplinas en select:', e);
    }
}

// ────────────────────────────────────────────────────────────
//  LOGIN
// ────────────────────────────────────────────────────────────
async function loginUsuario() {
    const credencial = document.getElementById("loginMatri").value;
    const password   = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(apiLogin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credencial, password })
        });
        const data = await response.json();

        if (data.success) {
            const usuarioInfo = {
                id:           data.user.id,
                identificador: data.user.identificador,
                nombre:       data.user.nombre,
                apellidos:    data.user.apellidos,
                email:        data.user.email,
                telefono:     data.user.telefono,
                rol:          data.user.rol,
                estatus:      data.user.estatus,
                create_at:    data.user.created_at,
                frecuencia:   data.user.es_frecuente
            };
            localStorage.setItem('usuarioInfo', JSON.stringify(usuarioInfo));
            console.log('Usuario logueado:', data.user.nombre);

            if (data.user.rol === 'Admin' || data.user.rol === 'Operador') {
                window.location.href = './administracion.html';
            } else {
                window.location.href = './Dashboard.html';
            }
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// ────────────────────────────────────────────────────────────
//  GUARDAR ARTÍCULO (con cantidad + descripción)
// ────────────────────────────────────────────────────────────
async function guardarArticulo() {
    const nombre       = document.getElementById("nombreArticulo").value.trim();
    const disciplina   = document.getElementById("disciplina").value;
    const estado       = document.getElementById("estado").value;
    const tipoMaterial = document.getElementById("tipoMaterial").value;
    const cantidad     = parseInt(document.getElementById("cantidadArticulo").value) || 1;
    const descripcion  = document.getElementById("descripcionArticulo").value.trim();

    if (!nombre || !disciplina || !estado || !tipoMaterial) {
        mostrarToast('⚠️ Por favor completa todos los campos obligatorios.', 'warn');
        return;
    }

    try {
        const response = await fetch("/api/articulo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, disciplina, estado, tipoMaterial, cantidad, descripcion }),
        });
        const data = await response.json();

        if (data.success) {
            mostrarToast('✅ Material registrado correctamente.', 'success');
            document.getElementById("formArticulo").reset();
            document.getElementById("cantidadArticulo").value = 1;
            document.getElementById("contenedor-formulario").classList.add('hidden');
            cargarArticulos();
            contarTotalMateriales();
            contarDisponibles();
        } else {
            mostrarToast('❌ ' + (data.error || data.message), 'error');
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        mostrarToast('❌ Error al conectar con el servidor.', 'error');
    }
}

// ────────────────────────────────────────────────────────────
//  CARGAR ARTÍCULOS (tabla con cantidad + descripción)
// ────────────────────────────────────────────────────────────
function cargarArticulos() {
    const info    = JSON.parse(localStorage.getItem('usuarioInfo') || '{}');
    const esAdmin = info.rol === 'Admin' || info.rol === 'Operador';

    fetch("http://localhost:3001/api/consultar/articulo")
        .then(r => r.json())
        .then(data => {
            if (!data.success) { console.error("Error:", data.error); return; }

            const tablaCuerpo = document.getElementById("tabla-cuerpo");
            tablaCuerpo.innerHTML = "";

            if (data.articulos.length === 0) {
                tablaCuerpo.innerHTML = `
                  <tr class="empty-row">
                    <td colspan="8">
                      <i class="fa-solid fa-box-open"></i>
                      No hay materiales en el catálogo todavía.
                    </td>
                  </tr>`;
                return;
            }

            // Filtrar por búsqueda actual
            const q = (document.getElementById('searchMaterial')?.value || '').toLowerCase();

            let articulosFiltrados = data.articulos;
            if (q) {
                articulosFiltrados = data.articulos.filter(a =>
                    `${a.nombre_material} ${a.nombre_disciplina} ${a.tipoMaterial} ${a.descripcion || ''}`.toLowerCase().includes(q)
                );
            }

            articulosFiltrados.forEach(articulo => {
                const dispBadge = articulo.disponible == 1
                    ? `<span class="badge-disponible"><i class="fa-solid fa-circle-check"></i> Sí</span>`
                    : `<span class="badge-no-disponible"><i class="fa-solid fa-circle-xmark"></i> No</span>`;

                const desc = articulo.descripcion
                    ? `<span class="desc-cell" title="${articulo.descripcion}">${articulo.descripcion}</span>`
                    : `<span style="color:#cbd5e1;">—</span>`;

                const accionesHTML = esAdmin ? `
                    <button class="btn-icon edit" title="Editar" onclick="editarMaterial(${articulo.id})">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon delete" title="Eliminar" onclick="eliminarMaterial(${articulo.id})">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>` : '';

                const fila = document.createElement("tr");
                fila.innerHTML = `
                  <td><strong>${articulo.nombre_material}</strong></td>
                  <td style="font-weight:600; color:var(--guinda);">${articulo.cantidad || 1}</td>
                  <td>${articulo.nombre_disciplina || '—'}</td>
                  <td>${articulo.tipoMaterial || '—'}</td>
                  <td>${articulo.estado || '—'}</td>
                  <td>${dispBadge}</td>
                  <td>${desc}</td>
                  <td class="actions">${accionesHTML}</td>
                `;
                tablaCuerpo.appendChild(fila);
            });
        })
        .catch(error => console.error("Error de conexión:", error));
}

// ────────────────────────────────────────────────────────────
//  BUSCADOR en tiempo real
// ────────────────────────────────────────────────────────────
function activarBuscador() {
    const input = document.getElementById('searchMaterial');
    if (!input) return;
    input.addEventListener('input', () => cargarArticulos());
}

// ────────────────────────────────────────────────────────────
//  CONTADORES
// ────────────────────────────────────────────────────────────
function contarTotalMateriales() {
    const elTotal = document.getElementById("articulos");
    if (!elTotal) return;
    fetch("http://localhost:3001/api/totalArt")
        .then(r => r.json())
        .then(data => { if (data.success) elTotal.textContent = data.total; })
        .catch(() => { elTotal.textContent = "–"; });
}

function contarDisponibles() {
    const dispon = document.getElementById("disponibles");
    if (!dispon) return;
    fetch("http://localhost:3001/api/totalArt")
        .then(r => r.json())
        .then(data => { if (data.success) dispon.textContent = data.disponibles; })
        .catch(() => { dispon.textContent = "–"; });
}

// ────────────────────────────────────────────────────────────
//  EDITAR MATERIAL
// ────────────────────────────────────────────────────────────
window.editarMaterial = async function (id) {
    let disciplinas = [];
    try {
        const res   = await fetch('http://localhost:3001/api/disciplina');
        const dData = await res.json();
        if (dData.success) disciplinas = dData.disciplinas;
    } catch (e) { console.error("No se pudieron cargar disciplinas:", e); }

    const nuevoNombre = prompt("Nuevo nombre del artículo:");
    if (!nuevoNombre) return;

    let optsDisciplina = disciplinas.map(d => `${d.id}=${d.nombre}`).join(", ");
    const nuevaDisciplinaStr = prompt(`ID de la disciplina (${optsDisciplina || 'no cargadas'}):`);
    const nuevaDisciplina    = parseInt(nuevaDisciplinaStr);
    if (isNaN(nuevaDisciplina)) { alert("Debes ingresar el ID numérico de la disciplina."); return; }

    const nuevoEstado = prompt("Estado (Nuevo / Bueno / Regular / Muy-desgastado / Roto):");
    if (!nuevoEstado) return;

    const nuevaDisponibilidad = prompt("¿Está disponible? (si / no):");
    if (!nuevaDisponibilidad) return;

    const nuevaCantidad    = prompt("Cantidad:");
    const nuevaDescripcion = prompt("Descripción (opcional):");

    try {
        const response = await fetch(`http://localhost:3001/api/articulo/${id}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre:       nuevoNombre,
                disciplina:   nuevaDisciplina,
                estado:       nuevoEstado,
                disponible:   (['sí','si','s','yes','1'].includes(nuevaDisponibilidad.toLowerCase())) ? 1 : 0,
                cantidad:     parseInt(nuevaCantidad) || 1,
                descripcion:  nuevaDescripcion || ''
            }),
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('✅ Artículo editado correctamente.', 'success');
            cargarArticulos();
            contarTotalMateriales();
            contarDisponibles();
        } else {
            mostrarToast('❌ ' + data.error, 'error');
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        mostrarToast('❌ Error al conectar con el servidor.', 'error');
    }
};

// ────────────────────────────────────────────────────────────
//  ELIMINAR MATERIAL
// ────────────────────────────────────────────────────────────
window.eliminarMaterial = async function (id) {
    if (!confirm("¿Estás seguro de eliminar este material?")) return;

    try {
        const response = await fetch(`http://localhost:3001/api/articulo/${id}`, { method: "DELETE" });
        const data     = await response.json();

        if (data.success) {
            mostrarToast('✅ Artículo eliminado correctamente.', 'success');
            cargarArticulos();
            contarTotalMateriales();
            contarDisponibles();
            return;
        }

        if (data.requiereForzar) {
            if (confirm(data.error + "\n\nPresiona Aceptar para eliminar definitivamente.")) {
                const res2  = await fetch(`http://localhost:3001/api/articulo/${id}?forzar=true`, { method: "DELETE" });
                const data2 = await res2.json();
                if (data2.success) {
                    mostrarToast('✅ Artículo y su historial eliminados.', 'success');
                    cargarArticulos();
                    contarTotalMateriales();
                    contarDisponibles();
                } else {
                    mostrarToast('❌ ' + data2.error, 'error');
                }
            }
            return;
        }
        mostrarToast('❌ ' + data.error, 'error');

    } catch (error) {
        console.error("Error de conexión:", error);
        mostrarToast('❌ Error al conectar con el servidor.', 'error');
    }
};

// ────────────────────────────────────────────────────────────
//  USUARIOS – contador para panel admin
// ────────────────────────────────────────────────────────────
async function guardarUsuario() {
    try {
        const rolSeleccionado = document.getElementById("rol").value;
        const datos = {
            identificador: document.getElementById("iden").value,
            nombres:       document.getElementById("nombre").value,
            apellidos:     document.getElementById("apellidos").value,
            email:         document.getElementById("correo").value,
            password:      document.getElementById("passwordUs").value,
            numero:        document.getElementById("tel").value,
            rol:           rolSeleccionado,
        };
        if (!datos.nombres || !datos.email || !datos.rol) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        const response = await fetch("http://localhost:3001/api/usuario", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(datos),
        });
        const resultado = await response.json();
        if (resultado.success) {
            alert("✅ Usuario registrado con éxito");
            document.getElementById('formUsuarios').reset();
        } else {
            alert("❌ Error: " + resultado.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
    }
}

// ────────────────────────────────────────────────────────────
//  TOAST – Notificaciones flotantes
// ────────────────────────────────────────────────────────────
function mostrarToast(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position:fixed; bottom:24px; right:24px;
            display:flex; flex-direction:column; gap:10px; z-index:9999;`;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
        error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
        warn:    { bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
    };
    const c = colors[tipo] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
        background:${c.bg}; border:1px solid ${c.border}; color:${c.color};
        padding:12px 18px; border-radius:10px; font-size:0.9rem; font-weight:500;
        box-shadow:0 4px 12px rgba(0,0,0,0.10);
        animation:slideInToast 0.3s ease-out;
        max-width:340px;`;
    toast.textContent = mensaje;

    if (!document.getElementById('toast-keyframes')) {
        const style = document.createElement('style');
        style.id = 'toast-keyframes';
        style.textContent = `
            @keyframes slideInToast {
                from { opacity:0; transform:translateX(40px); }
                to   { opacity:1; transform:translateX(0); }
            }`;
        document.head.appendChild(style);
    }

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
