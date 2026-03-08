document.getElementById('formUsuarios').addEventListener('submit', async (e) => {
    e.preventDefault();

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
        const response = await fetch('/api/usuario', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert('✅ Usuario registrado con éxito');
            e.target.reset(); // Limpia el formulario
        } else {
            alert('❌ Error: ' + resultado.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

/*--------------- codigo para hacer login------------------*/

// Función para disparar desde el botón "Entrar"
async function loginUsuario() {
    const credencial = document.getElementById('loginMatri').value; // Puede ser email o ID
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/usuario/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credencial, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar info básica si es necesario y redirigir
            console.log('Usuario logueado:', data.user);
            window.location.href = './Dashboard.html'; 
        } else {
            console.log(data.message); // "Contraseña incorrecta" o "Usuario no existe"
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}