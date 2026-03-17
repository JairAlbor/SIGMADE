//formArticulo.addEventListener("submit", guardarArticulo)

const apiLogin ='http://localhost:3001/api/login';
const apiTest = 'http://localhost:3001/api/test';



async function guardarUsuario(event) {
    if (event) event.preventDefault(); // Evitar que el formulario recargue la página

    try {
        // 1. Capturamos los valores de los Selects y Radios
        const rolSeleccionado = document.getElementById('rol').value;
       
        // 2. Armamos el objeto de datos
        const datos = {
            identificador: document.getElementById('iden').value,
            nombres: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            email: document.getElementById('correo').value,
            password: document.getElementById('passwordUs').value,
            numero: document.getElementById('tel').value,
            rol: rolSeleccionado, // Ahora sí está definido
         };

        // 3. Validación básica
        if (!datos.nombres || !datos.email || !datos.rol) {
            alert('Por favor, completa todos los campos, incluyendo la frecuencia.');
            return;
        }

        // 4. Envío al servidor
        const response = await fetch('http://localhost:3001/api/usuario', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert('✅ Usuario registrado con éxito');
            if (event && event.target) event.target.closest('form').reset(); // Limpia el formulario de forma segura
        } else {
            alert('❌ Error: ' + resultado.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
};

/*--------------- codigo para hacer login------------------*/

// Función para disparar desde el botón "Entrar"
async function loginUsuario(event) {
    if (event) event.preventDefault(); // Evitar que el formulario recargue la página

    const credencial = document.getElementById('loginMatri').value; // Puede ser email o ID
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(apiLogin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credencial, password })
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('nombreUsuario', data.user.nombre);
            // Guardar info básica si es necesario y redirigir
          console.log('Usuario logueado:', data.user.nombre);
            if (data.user.rol === 'Admin') {
                window.location.href = 'administracion.html'; 
            } else {
                window.location.href = 'Dashboard.html'; 
            }
            // Mover esto aquí causa error porque 'nombre' no está definido, usar data.user.nombre
            // document.getElementById('userName').textContent = `Hola, ${data.user.nombre}`;
        } else {
            alert(data.message); // Avisar al usuario si falla
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
};




// Función para guardar proyecto
