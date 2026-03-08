const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CORREGIDO)
app.use(express.static(path.join(__dirname, '..'))); // Apunta a la carpeta SIGMADE

// Importar rutas
const usuariosRoutes = require('./rutas/usuario'); // Nota: estás usando "rutas" no "routes"

// Usar rutas
app.use('/api/usuario', usuariosRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Buscando archivos en:', path.join(__dirname, '..'));
});