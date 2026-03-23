//formArticulo.addEventListener("submit", guardarArticulo)

const apiLogin = "http://localhost:3001/api/login";
const apiTest = "http://localhost:3001/api/total";


window.addEventListener('DOMContentLoaded', function() {
    cargarArticulos();
    contarTotalMateriales();
  //  contarDisponibles(); // Llamamos a la función para contar disponibles al cargar la página
    // Puedes agregar todas las que quieras
});


//window.onload = contarDisponibles;

async function guardarUsuario() {
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
      rol: rolSeleccionado, // Ahora sí está definido
    };

    // 3. Validación básica
    if (!datos.nombres || !datos.email || !datos.rol) {
      alert("Por favor, completa todos los campos, incluyendo la frecuencia.");
      return;
    }

    // 4. Envío al servidor
    const response = await fetch("http://localhost:3001/api/usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (resultado.success) {
      alert("✅ Usuario registrado con éxito");
      e.target.reset(); // Limpia el formulario
    } else {
      alert("❌ Error: " + resultado.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
}

/*--------------- codigo para hacer login------------------*/

// Función para disparar desde el botón "Entrar"
async function loginUsuario() {
  const credencial = document.getElementById("loginMatri").value; // Puede ser email o ID
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(apiLogin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credencial, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("nombreUsuario", data.user.nombre);
      // Guardar info básica si es necesario y redirigir
      console.log("Usuario logueado:", data.user.nombre);
      if (data.user.rol === "Admin") {
        window.location.href = "./administracion.html";
      } else {
        window.location.href = "./Dashboard.html";
      }
      document.getElementById("userName").textContent = `Hola, ${nombre}`;
    } else {
      console.log(data.message); // "Contraseña incorrecta" o "Usuario no existe"
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

async function guardarArticulo() {
  const nombre = document.getElementById("nombreArticulo").value;
  const disciplina = document.getElementById("disciplina").value;
  const estado = document.getElementById("estado").value;
  const disponible = document.getElementById("disponible").value;

  fetch("/api/articulo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, disciplina, estado, disponible }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Artículo registrado correctamente");
        document.getElementById("formArticulo").reset();
        cargarArticulos(); // Refrescar la lista después de guardar
      } else {
        alert("Error al registrar el artículo: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor");
    });
}

function cargarArticulos() {
  fetch("http://localhost:3001/api/consultar/articulo")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const tablaCuerpo = document.getElementById("tabla-cuerpo");
        tablaCuerpo.innerHTML = ""; // Limpiamos solo las filas

        data.articulos.forEach((articulo) => {
          // Lógica para el color del badge (basada en tu CSS)
          // Si el dato viene de una BD, podrías comparar por ID o por nombre
          const badgeClass =
            articulo.disciplina_id === "Deporte"
              ? "badge-deporte"
              : "badge-libro";

          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td><strong>${articulo.nombre_material}</strong></td>
            <td>${articulo.nombre_disciplina}</span></td>
            <td>${articulo.tipoMaterial}</td>
            <td>${articulo.estado}</td>
            <td class="text-green">${articulo.disponible || 0}</td>
            <td class="actions">
                <button class="btn-icon edit" onclick="editarMaterial(${articulo.id})">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete" onclick="eliminarMaterial(${articulo.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
          `;
          tablaCuerpo.appendChild(fila);
        });
      } else {
        console.error("Error:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
    });
}
// Función para contar total de artículos
function contarTotalMateriales() {
  const elTotal = document.getElementById("articulos");
  
  if (!elTotal) {
    console.error("❌ Elemento con id 'articulos' no encontrado");
    return;
  }

  fetch("http://localhost:3001/api/totalArt")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        elTotal.textContent = data.total;
        console.log("✅ Total actualizado:", data.total);
      } else {  
        console.error("Error al obtener el total:", data.error);
        elTotal.textContent = "Error";
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      elTotal.textContent = "Error";
    });
}

// Función para contar artículos disponibles
function contarDisponibles() {
  const dispon = document.getElementById("disponibles");
  
  if (!dispon) {
    console.error("❌ Elemento con id 'disponibles' no encontrado");
    return;
  }

  fetch("http://localhost:3001/api/total")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // ✅ Usar data.disponibles que viene del endpoint
        dispon.textContent = data.disponibles;
        console.log("✅ Disponibles actualizado:", data.disponibles);
        console.log("Total de materiales:", data.total); // Info adicional
      } else {
        console.error("Error:", data.error);
        dispon.textContent = "Error";
      }
    })
    .catch((error) => {
      console.error("Error de conexión:", error);
      dispon.textContent = "Error";
      alert("Error al conectar con el servidor");
    });
}

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
    fetch(`/api/articulo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
function eliminarMaterial(id) {
  if (confirm("¿Estás seguro de eliminar este material?")) {
    fetch(`/api/articulo/${id}`, {  
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Artículo eliminado correctamente");
          cargarArticulos(); // Refrescar la lista después de eliminar
          contarTotalMateriales(); // Actualizar el total después de eliminar
       //   contarDisponibles(); // Actualizar disponibles después de eliminar
        } else {
          alert("Error al eliminar el artículo: " + data.error);
        } 
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor");
      });
  }
}