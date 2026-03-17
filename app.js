//formArticulo.addEventListener("submit", guardarArticulo)

const apiLogin = "http://localhost:3001/api/login";
const apiTest = "http://localhost:3001/api/test";

window.onload = cargarArticulos

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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credencial, password })
        });

        const data = await response.json();

        if (data.success) {
            const usuarioInfo={
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

async function guardarArticulo(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombreArticulo').value;
    const disciplina = document.getElementById('disciplina').value;
    const estado = document.getElementById('estado').value;
    const disponible = document.getElementById('disponible').value;

    fetch('/api/articulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, disciplina, estado, disponible })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Artículo registrado correctamente');
            document.getElementById('formArticulo').reset();
        } else {
            alert('Error al registrar el artículo: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error de conexión:', error);
        alert('Error al conectar con el servidor');
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
  fetch("/api/consultar/articulo")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const tablaCuerpo = document.getElementById("tabla-cuerpo");
        tablaCuerpo.innerHTML = ""; // Limpiamos solo las filas

        data.articulos.forEach((articulo) => {
          // Lógica para el color del badge (basada en tu CSS)
          // Si el dato viene de una BD, podrías comparar por ID o por nombre
          const badgeClass = articulo.disciplina_id === "Deporte" ? "badge-deporte" : "badge-libro";
          
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td><strong>${articulo.nombre}</strong></td>
            <td>${articulo.disciplina_id}</span></td>
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

// Función para guardar proyecto
