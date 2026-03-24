window.onload = contarTotalUsuarios(); // Llamamos a la función para contar usuarios al cargar la página

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

  fetch("http://localhost:3001/api/usuario/num", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
window.onclick = function(event) {
    const modal = document.getElementById('modalUsuarios');
    // Si el usuario hace clic en el overlay (fondo oscuro), se cierra
    if (event.target == modal) {
        toggleModal('modalUsuarios');
    }
}

// Función para consultar y mostrar los usuarios registrados

function consultarUsuarios() {
  fetch("http://localhost:3001/api/usuario", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
                <button class="btn-icon edit" title="Editar" onclick="editarUsuario(${usuario.id})">
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
  fetch(`http://localhost:3001/api/usuario/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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

//funcion para eliminar un usuario por su ID
function eliminarUsuario(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
    fetch(`http://localhost:3001/api/usuario/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("✅ Usuario eliminado:", data.usuario);
          //linea para abir el modal de usuarios registrados después de eliminar un usuario
          toggleModal('modalUsuarios');
          
         
          // Actualizar la lista de usuarios después de eliminar
          consultarUsuarios();
          contarTotalUsuarios(); // Actualizar el total de usuarios después de eliminar
          
        } else {
          console.error("Error:", data.error);
          alert("Error al eliminar el usuario");
        }
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor");
      });
  }
}


// Llamamos a la función para consultar usuarios al cargar la página
window.onload = () => {
  contarTotalUsuarios();
};
