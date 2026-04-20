// ============================================================
//  SIGMADE – app.js
//  Catálogo de Material: CRUD + visibilidad por rol
// ============================================================

// API URL Detección dinámica
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const apiLogin = `${API_BASE}/api/login`;
const apiTest = `${API_BASE}/api/total`;


// Consolidado abajo en el listener de la línea 287

let isEditing = false;
let editId = null;

//window.onload = contarDisponibles;

async function guardarUsuario(event) {
  if (event) event.preventDefault(); // Evitar recarga de página

  try {
    // 1. Capturamos los valores de los Selects y Radios
    const rolSeleccionado = document.getElementById("rol").value;

    // 2. Armamos el objeto de datos
    const datos = {
      identificador: document.getElementById("iden").value,
      nombres: document.getElementById("nombre").value,
      apellidos: document.getElementById("apellidos").value,
      email: document.getElementById("correo").value,
      password: document.getElementById("passwordUs").value,
      numero: document.getElementById("tel").value,
      rol: rolSeleccionado,
    };

    // 3. Validación básica
    if (!datos.nombres || !datos.email || !datos.rol) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // 4. Envío al servidor
    const response = await fetch(`${API_BASE}/api/usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (resultado.success) {
      alert("✅ Usuario registrado con éxito");
      event.target.reset(); // Limpia el formulario
    } else {
      alert("❌ Error: " + resultado.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
}

// ────────────────────────────────────────────────────────────
//  LOGIN
// ────────────────────────────────────────────────────────────
async function loginUsuario(event) {
  if (event) event.preventDefault(); // Detener la recarga de página

  const credencial = document.getElementById("loginMatri").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(apiLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credencial, password })
    });

    const data = await response.json();

    if (data.success) {
      const usuarioInfo = {
        nombre: data.user.nombre,
        apellidos: data.user.apellidos,
        email: data.user.email,
        telefono: data.user.telefono,
        rol: data.user.rol,
        estatus: data.user.estatus,
        create_at: data.user.create_at
      }

      // Guardar la información del usuario en localStorage
      localStorage.setItem('usuarioInfo', JSON.stringify(usuarioInfo));
      localStorage.setItem('userToken', data.token);

      console.log('Usuario logueado:', data.user.nombre);

      // Redirigir según el rol
      if (data.user.rol === 'Admin') {
        window.location.href = './administracion.html';
      } else {
        window.location.href = './Dashboard.html';
      }
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    alert("Error al conectar con el servidor");
  }
}


let catalogoData = [];

async function guardarArticulo() {
  const form = document.getElementById("formArticulo");
  const formData = new FormData(form);

  // Mapear IDs si es necesario o enviar directamente
  // Note: FormData keys must match backend req.body or req.file
  // nombreArticulo -> nombre, etc.

  const payload = new FormData();
  payload.append('nombre', document.getElementById("nombreArticulo").value);
  payload.append('disciplina', document.getElementById("disciplina").value);
  payload.append('estado', document.getElementById("estado").value);
  payload.append('tipoMaterial', document.getElementById("tipoMaterial").value);
  payload.append('cantidad', document.getElementById("cantidadArticulo").value);
  payload.append('descripcionArticulo', (document.getElementById("descripcionArticulo") ? document.getElementById("descripcionArticulo").value : ''));

  const fileInput = document.getElementById("imagen");
  if (fileInput && fileInput.files[0]) {
    payload.append('imagen', fileInput.files[0]);
  }

  fetch(`${API_BASE}/api/articulo`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('userToken')}`
    },
    body: payload,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("✅ " + data.mensaje);
        form.reset();
        if (typeof contenedorForm !== 'undefined') contenedorForm.classList.add('hidden');
        else document.getElementById('contenedor-formulario').classList.add('hidden');

        cargarArticulos();
        // contarTotalMateriales removido
        contarDisponibles();
      } else {
        alert("❌ Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    });
}

async function cargarDisciplinasParaSelect() {
  try {
    const res = await fetch(`${API_BASE}/api/disciplina`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById("disciplina");
      if (select) {
        select.innerHTML = '<option value="">Seleccionar disciplina…</option>';
        data.disciplinas.forEach(d => {
          select.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
        });
      }
    }
  } catch (err) { console.error("Error cargando disciplinas:", err); }
}

function cargarArticulos() {
  fetch(`${API_BASE}/api/consultar/articulo`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        catalogoData = data.articulos;
        filtrarCatalogo(); // Muestra todos inicialmente
      } else {
        console.error("Error:", data.message);
      }
    })
    .catch((error) => console.error("Error de conexión:", error));
}

function renderArticulos(lista) {
  const tablaCuerpo = document.getElementById("tabla-cuerpo");
  if (!tablaCuerpo) return;
  tablaCuerpo.innerHTML = "";

  if (lista.length === 0) {
    tablaCuerpo.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:#666;">No se encontraron artículos.</td></tr>';
    return;
  }

  lista.forEach((articulo) => {
    const id_rep = articulo.id_representativo;
    const disponibleStr = `${articulo.unidades_disponibles} de ${articulo.total_unidades}`;
    const colorDisp = articulo.unidades_disponibles > 0 ? "text-green" : "text-red";

    const imgSrc = articulo.imagen ? `${API_BASE}${articulo.imagen}` : 'LOGO-UTM.jpeg';

    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td><img src="${imgSrc}" alt="Material" style="height:40px; border-radius:4px; object-fit:cover;"></td>
        <td><strong>${articulo.nombre_material}</strong></td>
        <td>${articulo.total_unidades}</td>
        <td>${articulo.nombre_disciplina}</td>
        <td>${articulo.tipoMaterial}</td>
        <td><small>${articulo.descripcion || '<span style="color:#999;">Sin desc.</span>'}</small></td>
        <td>${articulo.estado}</td>
        <td class="${colorDisp}" style="font-weight:bold;">${disponibleStr}</td>
        <td class="actions">
            <button class="btn-icon edit" onclick="editarMaterial(${id_rep})">
                <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-icon delete" onclick="eliminarMaterial(${id_rep}, ${articulo.total_unidades})">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        </td>
        `;
    tablaCuerpo.appendChild(fila);
  });
}

function filtrarCatalogo() {
  const q = document.getElementById('searchMaterial') ? document.getElementById('searchMaterial').value.toLowerCase() : '';
  const st = document.getElementById('filtroEstadoMaterial') ? document.getElementById('filtroEstadoMaterial').value : '';
  const disp = document.getElementById('filtroDisponibilidad') ? document.getElementById('filtroDisponibilidad').value : '';

  const filtrados = catalogoData.filter(a => {
    // Robustez ante nulos (especialmente tras LEFT JOIN en el backend)
    const searchable = `${a.nombre_material || ''} ${a.nombre_disciplina || ''} ${a.tipoMaterial || ''}`.toLowerCase();
    if (q && !searchable.includes(q)) return false;

    if (st && a.estado !== st) return false;
    if (disp === "Libre" && a.unidades_disponibles <= 0) return false;
    return true;
  });

  renderArticulos(filtrados);
}

function limpiarFiltrosCatalogo() {
  if (document.getElementById('searchMaterial')) document.getElementById('searchMaterial').value = '';
  if (document.getElementById('filtroEstadoMaterial')) document.getElementById('filtroEstadoMaterial').value = '';
  if (document.getElementById('filtroDisponibilidad')) document.getElementById('filtroDisponibilidad').value = '';
  filtrarCatalogo();
}
// Refaccionado: Una sola función para actualizar las 3 tarjetas de stats
function contarDisponibles() {
  const tot = document.getElementById("articulos");
  const dispon = document.getElementById("disponibles");
  const ocup = document.getElementById("ocupados");

  fetch(`${API_BASE}/api/totalArt`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        if (tot) tot.textContent = data.total;
        if (dispon) dispon.textContent = data.disponibles;
        if (ocup) ocup.textContent = data.ocupados;
      }
    })
    .catch((error) => console.error("Error stats:", error));
}

// Reemplazar la antigua inicialización para incluir chequeo de roles
window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('usuarioInfo'));
  if (user && user.rol === 'Alumno') {
    const btnAdd = document.getElementById('btn-abrir-formulario');
    const actionsTh = document.getElementById('th-acciones');
    if (btnAdd) btnAdd.style.display = 'none';

    // El banner ya está en el HTML, solo hay que mostrarlo si es alumno
    const banner = document.getElementById('bannerSoloLectura');
    if (banner) banner.classList.remove('hidden');
  }

  cargarArticulos();
  contarDisponibles();
  cargarDisciplinasParaSelect();
});


//funcion para editar material
function editarMaterial(id) {
  // Aquí podrías abrir un modal o redirigir a una página de edición
  //aun falta hacer un modal que pida la informacion nueva del articulo, pero en teoria con esto de manera
  //provicional ya podra actualizar
  const nuevoNombre = prompt("Ingrese el nuevo nombre del artículo:");
  const nuevaDisciplina = prompt("Ingrese la nueva disciplina:");
  const nuevoEstado = prompt("Ingrese el nuevo estado:");
  const nuevaDisponibilidad = prompt("¿Está disponible? (Sí/No)");

  if (nuevoNombre && nuevaDisciplina && nuevoEstado && nuevaDisponibilidad) {
    fetch(`${API_BASE}/api/articulo/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
      },
      body: JSON.stringify({
        nombre: nuevoNombre,
        disciplina: nuevaDisciplina,
        estado: nuevoEstado,
        disponible: nuevaDisponibilidad.toLowerCase() === "sí" ? 1 : 0,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Artículo editado correctamente");
          cargarArticulos(); // Refrescar la lista después de editar
          contarDisponibles(); // Actualizar disponibles después de editar
        } else {
          alert("Error al editar el artículo: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor");
      }
      );
  } else {
    alert("Todos los campos son obligatorios para editar el artículo.");
  }
}

//funcion para eliminar material
function eliminarMaterial(id, totalUnidades) {
  let cantidadAEliminar = 'todas';

  if (totalUnidades > 1) {
    const accion = prompt(`Este material tiene ${totalUnidades} unidades.\nEscribe "todas" para eliminarlas todas juntas, o pon el NUMERO de unidades que quieres eliminar (ej. 1, 2):`, "todas");

    if (accion === null) return; // Canceló

    if (accion.toLowerCase().trim() !== 'todas') {
      const num = parseInt(accion);
      if (isNaN(num) || num <= 0 || num > totalUnidades) {
        alert("Cantidad inválida.");
        return;
      }
      cantidadAEliminar = num;
    }
  } else {
    if (!confirm("¿Estás seguro de eliminar la única unidad de este material?")) return;
  }

  fetch(`${API_BASE}/api/articulo/${id}?cantidad=${cantidadAEliminar}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Artículo eliminado correctamente");
        cargarArticulos(); // Refrescar la lista después de eliminar
        // contarTotalMateriales removido // Actualizar el total después de eliminar
      } else {
        alert("❌ Error: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor para eliminar");
    });
}

// ============== FUNCIÓN PARA PROBAR EL TOKEN (JWT) ==============
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
    } else {
      alert("❌ Denegado:\n" + data.message);
    }
  } catch (error) {
    console.error("Error al probar token:", error);
    alert("Error de red intentando probar el token.");
  }
}

// --- FUNCIONES DE EDICIÓN ---

async function editarMaterial(id) {
  const modal = document.getElementById('modal-editar-material');
  const form = document.getElementById('formEditarArticulo');

  try {
    const res = await fetch(`${API_BASE}/api/articulo/${id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();

    if (data.success) {
      const art = data.articulo;
      document.getElementById('edit-id').value = id;
      document.getElementById('edit-nombre').value = art.nombre;
      document.getElementById('edit-estado').value = art.estado;
      document.getElementById('edit-tipo').value = art.tipoMaterial;
      document.getElementById('edit-descripcion').value = art.descripcion || '';

      // Cargar disciplinas en el select de edición
      const resDisc = await fetch(`${API_BASE}/api/disciplina`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
      });
      const dataDisc = await resDisc.json();
      const selectDisc = document.getElementById('edit-disciplina');
      selectDisc.innerHTML = '';
      dataDisc.disciplinas.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.nombre;
        if (d.id === art.disciplina_id) opt.selected = true;
        selectDisc.appendChild(opt);
      });

      modal.classList.remove('hidden');
      modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      alert("Error al obtener datos: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión al obtener material");
  }
}

function cerrarModalEditar() {
  document.getElementById('modal-editar-material').classList.add('hidden');
}

async function actualizarArticulo() {
  const id = document.getElementById('edit-id').value;
  const form = document.getElementById('formEditarArticulo');
  const formData = new FormData(form);

  try {
    const res = await fetch(`${API_BASE}/api/articulo/${id}`, {
      method: 'PUT',
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      alert("✅ Material actualizado correctamente");
      cerrarModalEditar();
      cargarArticulos();
      contarDisponibles();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error al conectar con el servidor para actualizar");
  }
}
