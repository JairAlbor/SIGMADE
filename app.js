// ============================================================
//  SIGMADE – app.js
//  Catálogo de Material: CRUD + visibilidad por rol
// ============================================================

const apiLogin = "http://localhost:3001/api/login";
const apiTest = "http://localhost:3001/api/total";


window.addEventListener('DOMContentLoaded', function () {
  cargarArticulos();
  contarTotalMateriales();
  contarDisponibles();
  if (typeof contarTotalUsuarios === 'function') contarTotalUsuarios();
  cargarDisciplinasSelect();

  //  contarDisponibles(); // Llamamos a la función para contar disponibles al cargar la página
  // Puedes agregar todas las que quieras
});

let isEditing = false;
let editId = null;

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

// ────────────────────────────────────────────────────────────
//  LOGIN
// ────────────────────────────────────────────────────────────
async function loginUsuario() {
  const credencial = document.getElementById("loginMatri").value; // Puede ser email o ID
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

      // Guardar la información del usuario en localStorage para covertilo en texto JSON
      localStorage.setItem('usuarioInfo', JSON.stringify(usuarioInfo));

      // Guardamos el token
      localStorage.setItem('userToken', data.token);

      // Guardar info básica si es necesario y redirigir
      console.log('Usuario logueado:', data.user.nombre);
      if (data.user.rol === 'Admin') {
        window.location.href = './administracion.html';
      } else {
        window.location.href = './Dashboard.html';
      }
      document.getElementById('userName').textContent = `Hola, ${nombre}`;
    } else {
      console.log(data.message); // "Contraseña incorrecta" o "Usuario no existe"
    }
  } catch (error) {
    console.error('Error de conexión:', error);
  }
};


async function guardarArticulo() {
  const nombre = document.getElementById("nombreArticulo").value;
  const disciplina_id = document.getElementById("disciplina").value;
  const estado = document.getElementById("estado").value;
  const tipoMaterial = document.getElementById("tipoMaterial").value;
  const cantidad = document.getElementById("cantidadArticulo").value;
  const descripcionArticulo = document.getElementById("descripcionArticulo").value;

  if (!nombre || !cantidad) {
    alert("⚠️ Por favor completa el Nombre y la Cantidad del material (*)");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("disciplina_id", disciplina_id);
  formData.append("estado", estado);
  formData.append("tipoMaterial", tipoMaterial);
  formData.append("cantidad", cantidad);
  formData.append("descripcionArticulo", descripcionArticulo);

  const fileInput = document.getElementById("imagen");
  if (fileInput && fileInput.files[0]) {
    formData.append("imagen", fileInput.files[0]);
  }

  try {
    const url = isEditing
      ? `http://localhost:3001/api/articulo/${editId}`
      : "http://localhost:3001/api/articulo";

    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
      },
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      alert(isEditing ? "✅ Material actualizado" : "✅ Artículo registrado correctamente");
      resetearFormulario();
      cargarArticulos();
      contarTotalMateriales();
      contarDisponibles();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Error al conectar con el servidor");
  }
}

function resetearFormulario() {
  isEditing = false;
  editId = null;
  document.getElementById("formArticulo").reset();
  document.getElementById("contenedor-formulario").classList.add("hidden");
  const titulo = document.getElementById("form-titulo");
  if (titulo) {
    titulo.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Material';
  }
}

async function editarMaterial(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/articulo/${id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    });
    const data = await response.json();

    if (data.success) {
      const art = data.articulo;

      // Cambiar modo a edición
      isEditing = true;
      editId = id;

      // Llenar campos
      document.getElementById("nombreArticulo").value = art.nombre;
      document.getElementById("cantidadArticulo").value = 1; // Por defecto 1 para editar por grupo o individual
      document.getElementById("disciplina").value = art.disciplina_id || "";
      document.getElementById("estado").value = art.estado || "Nuevo";
      document.getElementById("tipoMaterial").value = art.tipoMaterial || "";
      document.getElementById("descripcionArticulo").value = art.descripcion || "";

      // Cambiar UI
      document.getElementById("form-titulo").innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Material';
      document.getElementById("contenedor-formulario").classList.remove("hidden");
      document.getElementById("contenedor-formulario").scrollIntoView({ behavior: 'smooth' });
    } else {
      alert("Error al cargar datos: " + data.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
}

async function cargarDisciplinasSelect() {
  const select = document.getElementById("disciplina");
  if (!select) return;

  try {
    const response = await fetch("http://localhost:3001/api/disciplina", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('userToken')}`
      }
    });
    const data = await response.json();

    if (data.success) {
      select.innerHTML = '<option value="">Seleccionar disciplina...</option>';
      data.disciplinas.forEach((d) => {
        const option = document.createElement("option");
        option.value = d.id;
        option.textContent = d.nombre;
        select.appendChild(option);
      });
      console.log("✅ Disciplinas cargadas en el select");
    }
  } catch (error) {
    console.error("Error al cargar disciplinas:", error);
  }
}

function cargarArticulos() {
  fetch("http://localhost:3001/api/consultar/articulo", {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const tablaCuerpo = document.getElementById("tabla-cuerpo");
        tablaCuerpo.innerHTML = ""; // Limpiamos solo las filas

        data.articulos.forEach((articulo) => {
          const fila = document.createElement("tr");

          // Imagen con fallback si no existe
          const imgUrl = articulo.imagen ? articulo.imagen : 'img/placeholder-material.png';

          fila.innerHTML = `
            <td>
              <img src="${imgUrl}" alt="${articulo.nombre_material}" 
                   style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
            </td>
            <td><strong>${articulo.nombre_material}</strong></td>
            <td>${articulo.total_unidades}</td>
            <td><span class="badge-deporte">${articulo.nombre_disciplina || 'General'}</span></td>
            <td>${articulo.tipoMaterial}</td>
            <td>${articulo.estado}</td>
            <td class="text-green">${articulo.unidades_disponibles || 0} de ${articulo.total_unidades}</td>
            <td><small>${articulo.descripcion || 'Sin descripción'}</small></td>
            <td class="actions">
                <button class="btn-icon edit" onclick="editarMaterial(${articulo.id_representativo})">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete" onclick="eliminarMaterial(${articulo.id_representativo})">
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

  fetch("http://localhost:3001/api/totalArt", {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
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

  fetch("http://localhost:3001/api/totalArt", {
    headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
  })
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

//funcion para eliminar material
function eliminarMaterial(id) {
  const cantidad = prompt("¿Cuántas unidades deseas eliminar?\n(Escribe un número o 'todas')", "1");

  if (cantidad === null) return; // Cancelado por el usuario

  const queryParam = cantidad.toLowerCase() === 'todas' ? 'todas' : cantidad;

  if (confirm(`¿Estás seguro de eliminar ${queryParam === 'todas' ? 'todas las unidades' : queryParam + ' unidad(es)'}?`)) {
    fetch(`/api/articulo/${id}?cantidad=${queryParam}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem('userToken')}` }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.mensaje);
          cargarArticulos();
          contarTotalMateriales();
          contarDisponibles();
        } else {
          alert("❌ Error: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor");
      });
  }
}

// ============== FUNCIÓN PARA PROBAR EL TOKEN (JWT) ==============
async function probarRutaProtegida() {
  const token = localStorage.getItem('userToken');
  if (!token) {
    alert("⚠️ No hay token guardado. Debes iniciar sesión primero.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3001/api/test", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Aquí enviamos el token a la ruta protegida
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


