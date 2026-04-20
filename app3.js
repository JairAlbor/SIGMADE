// La inicialización se hace abajo con window.onload

// API URL Detección dinámica
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

//funcion para consultar el total de usuarios registrados
function contarTotalUsuarios() {
  const elTotal = document.getElementById("totalUser");
  const modalTotal = document.getElementById("totalUsersModal");
  const modalActive = document.getElementById("activeUsersModal");
  const modalInactive = document.getElementById("inactiveUsersModal");

  if (!elTotal) {
    console.error("❌ Elemento con id 'totalUser' no encontrado");
    return;
  }

  fetch(`${API_BASE}/api/usuario/num`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem('userToken')}`
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        elTotal.textContent = data.total;
        modalTotal.textContent = data.total; // Actualizar el total en el modal también
        modalActive.textContent = data.activos; // Actualizar el número de activos en el modal
        modalInactive.textContent = data.inactivos; // Actualizar el número de inactivos en el modal
        console.log("✅ Total de usuarios actualizado:", data.total);
      } else {
        console.error("Error:", data.error);
        elTotal.textContent = "Error";
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      elTotal.textContent = "Error";
      alert("Error al conectar con el servidor");
    });
}


/////////////////////////////////////codigo para mostrar el modal de usuarios registrados y su informacion en una tabla/////////////////////////////////////
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

// 2. Cerrar el modal al hacer clic en la "X" o fuera del contenido
window.onclick = function (event) {
  const modal = document.getElementById('modalUsuarios');
  // Si el usuario hace clic en el overlay (fondo oscuro), se cierra
  if (event.target == modal) {
    toggleModal('modalUsuarios');
  }
}

// Función para consultar y mostrar los usuarios registrados

function consultarUsuarios() {
  fetch(`${API_BASE}/api/usuario`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem('userToken')}`
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("✅ Usuarios registrados:", data.usuarios);
        const tablaImprimir = document.getElementById("tablaUsuariosBody");

        if (!tablaImprimir) {
          console.error("❌ Elemento con id 'tablaUsuariosBody' no encontrado");
          return;
        }

        tablaImprimir.innerHTML = ""; // Limpiar contenido previo

        currentUsersList = data.usuarios;

        // Opcional: Actualizar los números de las tarjetas KPI dinámicamente
        // document.querySelector('.stat-summary-card.total .number').innerText = data.usuarios.length;

        data.usuarios.forEach((usuario) => {
          const fila = document.createElement("tr");

          // Definimos el color del badge según el estatus
          const estatusClass = usuario.estatus === 'Activo' ? 'active' : 'inactive';

          fila.innerHTML = `
            <td><strong>${usuario.nombre} ${usuario.apellidos}</strong></td>
            <td>${usuario.email}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.telefono || 'N/A'}</td>
            <td>${new Date(usuario.created_at).toLocaleDateString()}</td>
            <td>
                <span class="status-pill ${estatusClass}">
                    ${usuario.estatus}
                </span>
            </td>
            <td class="actions">
                <button class="btn-icon edit" title="Editar" onclick="openEditarUsuario(${usuario.id})">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete" title="Eliminar" onclick="eliminarUsuario(${usuario.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
          `;
          tablaImprimir.appendChild(fila);
        });

        // Abrir el modal después de cargar los datos
        toggleModal('modalUsuarios');

      } else {
        console.error("Error:", data.error);
        alert("Error al obtener los usuarios");
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor");
    });
}

//funcion para consultar la informacion de un usuario específico por su ID
function consultarUsuarioPorID(id) {
  fetch(`${API_BASE}/api/usuario/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem('userToken')}`
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("✅ Usuario encontrado:", data.usuario);
        // Aquí puedes agregar código para mostrar la información del usuario en la página si lo deseas
      } else {
        console.error("Error:", data.error);
        alert("Error al obtener el usuario");
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor");
    });
}

// ========== EDITAR USUARIO COMPLETO ==========
let currentUsersList = [];

function openEditarUsuario(id) {
  const usuario = currentUsersList.find(u => u.id === id);
  if (!usuario) return;
  document.getElementById('editUserId').value = usuario.id;
  document.getElementById('editUserNombre').value = usuario.nombre;
  document.getElementById('editUserApellidos').value = usuario.apellidos || '';
  document.getElementById('editUserEmail').value = usuario.email;
  document.getElementById('editUserRol').value = usuario.rol;
  document.getElementById('editUserEstatus').value = usuario.estatus;
  document.getElementById('editarUsuarioModalOverlay').classList.remove('hidden');
}

function closeEditarUsuario() {
  document.getElementById('editarUsuarioModalOverlay').classList.add('hidden');
}

function guardarEdicionUsuario() {
  const id = document.getElementById('editUserId').value;
  const nombre = document.getElementById('editUserNombre').value;
  const apellidos = document.getElementById('editUserApellidos').value;
  const email = document.getElementById('editUserEmail').value;
  const rol = document.getElementById('editUserRol').value;
  const estatus = document.getElementById('editUserEstatus').value;

  if (!nombre || !email || !rol) {
    alert("Nombre, Email y Rol son obligatorios"); return;
  }

  // Promise All to update both Data and Estatus
  Promise.all([
    fetch(`${API_BASE}/api/usuario/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ nombre, apellidos, email, rol })
    }).then(r => r.json()),
    fetch(`${API_BASE}/api/usuario/${id}/estatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ estatus, motivo_sancion: "Editado por Admin" })
    }).then(r => r.json())
  ]).then(responses => {
    alert("✅ Usuario actualizado correctamente.");
    closeEditarUsuario();
    consultarUsuarios();
    contarTotalUsuarios();
  }).catch(err => {
    console.error(err);
    alert("Error al editar usuario.");
  });
}

function eliminarUsuario(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
    fetch(`${API_BASE}/api/usuario/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('✅ ' + data.mensaje);
          // close modal maybe? the user is not opening a modal for deleting

          // Actualizar tabla entrenadores
          consultarEntrenadores();
          contarTotalEntrenadores();
          contarTotalUsuarios(); // Actualizar el total de usuarios después de eliminar
        } else {
          alert('❌ ' + (data.error || 'Error al eliminar usuario'));
        }
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor");
      });
  }
}


// Llamamos a las funciones para cargar datos al cargar la página
window.onload = () => {
  contarTotalUsuarios();
  cargarStatsCard();
  contarTotalDisciplinas();
  contarTotalEntrenadores();
  contarTotalEventos();
};

function contarTotalEventos() {
  const el = document.getElementById('totalEventos');
  if (!el) return;

  fetch(`${API_BASE}/api/evento`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        el.textContent = data.eventos.length;
        if (document.getElementById('eventosCounterModal')) document.getElementById('eventosCounterModal').textContent = data.eventos.length;
      }
    }).catch(err => console.error('Error contando eventos:', err));
}

// ==== REGISTRO NUEVO USUARIO ====
async function registrarNuevoUsuario(e) {
  e.preventDefault();
  const rol = document.getElementById('nu_rol').value;
  const nombres = document.getElementById('nu_nombre').value;
  const apellidos = document.getElementById('nu_apellidos').value;
  const identificador = document.getElementById('nu_id').value;
  const numero = document.getElementById('nu_tel').value;
  const email = document.getElementById('nu_email').value;
  const password = document.getElementById('nu_pass').value;

  try {
    const response = await fetch(`${API_BASE}/api/usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      },
      body: JSON.stringify({ rol, nombres, apellidos, identificador, numero, email, password })
    });

    const data = await response.json();
    if (data.success) {
      alert("✅ Usuario registrado exitosamente");
      document.getElementById('formNuevoUsuario').reset();
      document.getElementById('registrarUsuarioBox').classList.add('hidden');
      consultarUsuarios(); // refrescar
      contarTotalUsuarios(); // refrescar
      contarTotalEntrenadores(); // en caso de ser entrenador
    } else {
      alert("❌ " + (data.message || data.error));
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión al registrar usuario");
  }
}


async function contarTotalDisciplinas() {
  const el = document.getElementById("totalDisciplinas");
  if (!el) return;

  try {
    const res = await fetch(`${API_BASE}/api/disciplina`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      el.textContent = data.disciplinas.length;
      const elModal = document.getElementById("disciplinasCounterModal");
      if (elModal) elModal.textContent = data.disciplinas.length;
    }
  } catch (err) { console.error('Error contando disciplinas:', err); }
}

async function cargarUsuariosParaAsignar() {
  try {
    const res = await fetch(`${API_BASE}/api/usuario`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById("selectNuevoEntrenador");
      if (select) {
        select.innerHTML = '<option value="">Seleccione usuario...</option>';
        data.usuarios.forEach(user => {
          select.innerHTML += `<option value="${user.id}">${user.nombre} ${user.apellidos || ''} (${user.rol})</option>`;
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function asignarRolEntrenador() {
  const id = document.getElementById("selectNuevoEntrenador").value;
  if (!id) return alert("Seleccione un usuario");

  try {
    const res = await fetch(`${API_BASE}/api/usuario/${id}/rol`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ rol: "Docente" }) // A "Docente" es entrenador en nuestra app
    });
    const data = await res.json();

    if (data.success) {
      alert('✅ Usuario asignado como Entrenador / Docente');
      document.getElementById('asignarEntrenadorBox').classList.add('hidden');
      consultarEntrenadores();
      contarTotalEntrenadores();
    } else {
      alert('❌ Error: ' + data.error);
    }
  } catch (err) { console.error(err); }
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
      console.log("Prueba superada:", data);
    } else {
      alert("❌ Denegado:\n" + data.message);
    }
  } catch (error) {
    console.error("Error al probar token:", error);
    alert("Error de red intentando probar el token.");
  }
}

// ========================================================
// ============ MODAL ENTRENADORES ========================
// ========================================================
let entrenadoresList = [];

function openEntrenadores() {
  document.getElementById('entrenadoresModalOverlay').classList.remove('hidden');
  cargarEntrenadoresModal();
}

function closeEntrenadores() {
  document.getElementById('entrenadoresModalOverlay').classList.add('hidden');
}

function contarTotalEntrenadores() {
  const el = document.getElementById('totalEntrenadores');
  if (!el) return;

  fetch(`${API_BASE}/api/entrenador`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        el.textContent = data.entrenadores.length;
        if (document.getElementById('entrenadoresCounterModal')) document.getElementById('entrenadoresCounterModal').textContent = data.entrenadores.length;
      }
    }).catch(err => console.error('Error contando entrenadores:', err));
}

function cargarEntrenadoresModal() {
  fetch(`${API_BASE}/api/entrenador`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        entrenadoresList = data.entrenadores;
        renderEntrenadores(entrenadoresList);
      }
    }).catch(err => console.error(err));
}

function renderEntrenadores(lista) {
  const tbody = document.getElementById('tablaEntrenadoresBody');
  const counter = document.getElementById('entrenadoresCounter');
  const thead = document.querySelector('#entrenadoresModalOverlay thead tr');

  if (thead && thead.cells.length < 5) {
    const th = document.createElement('th');
    th.textContent = 'Acciones';
    thead.appendChild(th);
  }

  if (!tbody) return;
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#666;">No hay entrenadores</td></tr>';
    if (counter) counter.textContent = '0 entrenadores';
    return;
  }

  lista.forEach(e => {
    const statusClass = e.estatus === 'Activo' ? 'active' : 'inactive';
    tbody.innerHTML += `
      <tr>
        <td><strong>${e.nombre} ${e.apellidos || ''}</strong></td>
        <td><i class="fa-solid fa-chalkboard-user"></i> Entrenador / Docente</td>
        <td>
          <i class="fa-solid fa-envelope" style="color:#9ca3af;"></i> ${e.email}<br>
          <i class="fa-solid fa-phone" style="color:#9ca3af;"></i> ${e.telefono || 'N/A'}
        </td>
        <td><span class="status-pill ${statusClass}">${e.estatus}</span></td>
        <td class="actions">
            <button class="btn-icon delete" title="Quitar Rol Entrenador" onclick="quitarRolEntrenador(${e.id})">
                <i class="fa-solid fa-user-minus"></i>
            </button>
        </td>
      </tr>
    `;
  });
  if (counter) counter.textContent = `Mostrando ${lista.length} entrenador(es)`;
  if (document.getElementById('entrenadoresCounterModal')) document.getElementById('entrenadoresCounterModal').textContent = lista.length;
}

// ========================================================
// ============ MODAL DISCIPLINAS =========================
// ========================================================

function openDisciplines() {
  document.getElementById('disciplineModalOverlay').classList.remove('hidden');
  cargarEntrenadoresParaDisciplina();
  consultarDisciplinas();
}

function closeDisciplines() {
  document.getElementById('disciplineModalOverlay').classList.add('hidden');
}

async function cargarEntrenadoresParaDisciplina() {
  try {
    const res = await fetch(`${API_BASE}/api/entrenador/activos`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById("disciplinaEntrenador");
      if (select) {
        select.innerHTML = '<option value="">Seleccione Entrenador...</option>';
        data.entrenadores.forEach(e => {
          select.innerHTML += `<option value="${e.id}">${e.nombre} ${e.apellidos || ''}</option>`;
        });
      }
    }
  } catch (err) { console.error(err); }
}

async function consultarDisciplinas() {
  try {
    const res = await fetch(`${API_BASE}/api/disciplina`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      renderDisciplinas(data.disciplinas);
    }
  } catch (err) { console.error(err); }
}

function renderDisciplinas(lista) {
  const tbody = document.getElementById('disciplineTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  lista.forEach(d => {
    const entrenador = d.entrenador_nombre ? `${d.entrenador_nombre} ${d.entrenador_apellidos || ''}` : '<span style="color:#94a3b8;">Por Asignar</span>';
    tbody.innerHTML += `
            <tr>
                <td><strong>${d.nombre}</strong></td>
                <td>${entrenador}</td>
                <td style="text-align:center;">
                    <button class="btn-icon delete" onclick="eliminarDisciplina(${d.id})" style="color:#ef4444;">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
  });
}

async function saveDisciplina() {
  const nombre = document.getElementById('disciplinaNombre').value;
  const entrenador_id = document.getElementById('disciplinaEntrenador').value;

  if (!nombre) return alert("Ingrese el nombre de la disciplina");

  try {
    const res = await fetch(`${API_BASE}/api/disciplina`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ nombre, entrenador_id })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Disciplina agregada");
      document.getElementById('disciplinaNombre').value = '';
      consultarDisciplinas();
      contarTotalDisciplinas();
    }
  } catch (err) { console.error(err); }
}

async function eliminarDisciplina(id) {
  if (!confirm("¿Eliminar esta disciplina?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/disciplina/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await res.json();
    if (data.success) {
      consultarDisciplinas();
      contarTotalDisciplinas();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) { console.error(err); }
}

async function quitarRolEntrenador(id) {
  if (!confirm("¿Deseas quitar el rol de Entrenador a este usuario y volverlo Alumno?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/usuario/${id}/rol`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ rol: "Alumno" })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Rol actualizado");
      cargarEntrenadoresModal();
      contarTotalEntrenadores();
      contarTotalUsuarios();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) { console.error(err); }
}
