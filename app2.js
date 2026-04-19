
const formArticulo = document.getElementById("formArticulo");

formArticulo.addEventListener("submit", guardarArticulo);

async function guardarArticulo(event) {
    event.preventDefault();
    
    // Usar la URL exacta del backend (con el error ortográfico)
    const urlArticulo = '/api/articulo'; // NOTA: está escrito "ariculo" no "articulo"
    
    const articulo = {
        nombre: document.getElementById('nombreArticulo').value,
        disciplina: document.getElementById('disciplina').value,
        estado: document.getElementById('estado').value,
        disponible: document.getElementById('disponible').value
    };

    console.log('Enviando a:', urlArticulo);
    console.log('Datos:', articulo);

    try {
        const response = await fetch(urlArticulo, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('userToken')}`
            },
            body: JSON.stringify(articulo),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al guardar");
        }

        const data = await response.json();
        alert("Artículo creado: " + data.mensaje);

        formArticulo.reset();
        document.getElementById('contenedor-formulario').classList.add('hidden');
        
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar artículo: " + error.message);
    }
}

// Agregar funcionalidad para mostrar/ocultar formulario
document.getElementById('btn-abrir-formulario').addEventListener('click', function() {
    document.getElementById('contenedor-formulario').classList.remove('hidden');
});

document.getElementById('btn-cancelar').addEventListener('click', function() {
    document.getElementById('contenedor-formulario').classList.add('hidden');
    formArticulo.reset();
});