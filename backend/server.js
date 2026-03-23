const express = require('express');
const cors = require('cors');
const connection = require('./db'); // Esto es connection, no db
const path = require('path');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ RUTAS API ============
// (TODAS las rutas API van ANTES de express.static)

// Ruta de prueba
app.get('/api/test', (req, res) => {
    console.log('✅ GET /api/test');
    res.json({ message: 'Servidor funcionando' });
});


// LOGIN de usuario
app.post('/api/login', (req, res) => {
    console.log('🔐 POST /api/login - Body:', req.body);
    
    const { credencial, password } = req.body;

    if (!credencial || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan credenciales o contraseña' 
        });
    }

    // Usar connection (no db) con callback
    connection.query(
        'SELECT identificador, nombre, apellidos, email, password, rol, telefono FROM usuario WHERE email = ? OR identificador = ? LIMIT 1',
        [credencial, credencial],
        (err, rows) => {
            if (err) {
                console.error('❌ Error en query:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error en la base de datos' 
                });
            }

            if (rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'El usuario no existe.' 
                });
            }

            const usuario = rows[0];
          // console.log('👤 Usuario encontrado:', usuario.nombre);

            if (password === usuario.password) {
                res.json({
                    success: true,
                    message: 'Sesión iniciada correctamente',
                    user: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        apellidos: usuario.apellidos,
                        email: usuario.email,
                        password: usuario.password,
                        rol: usuario.rol,
                        telefono: usuario.telefono
                        
                    }
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'La contraseña es incorrecta.' 
                });
            }
        }
    );
});

// REGISTRO de usuario - CORREGIDO (usando /api/usuario que pide el frontend)
app.post('/api/usuario', (req, res) => {
    console.log('📝 POST /api/usuario - Body:', req.body);
    
    const { identificador, nombres, apellidos, email, password, numero, rol } = req.body;

    if (!nombres || !email || !rol) {
        return res.status(400).json({ 
            success: false,
            message: 'Campos obligatorios faltantes' 
        });
    }

    const query = 'INSERT INTO usuario (identificador, nombre, apellidos, email, password, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    connection.query(
        query, 
        [identificador, nombres, apellidos, email, password, numero, rol], 
        (err, result) => {
            if (err) {
                console.error('❌ Error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error al registrar usuario: ' + err.message 
                });
            }

            res.json({
                success: true,
                mensaje: 'Usuario registrado',
                id: result.insertId
            });
        }
    );
});

// insertar un nuevo ARTÍCULO
app.post('/api/articulo', (req, res) => {
    console.log('📦 POST /api/articulo - Body:', req.body);
    
    const { nombre, disciplina, estado, disponible } = req.body;

    if (!nombre || !disciplina) {
        return res.status(400).json({ 
            success: false,
            error: 'Campos obligatorios faltantes' 
        });
    }

    const query = 'INSERT INTO material (nombre, disciplina_id, estado, disponible) VALUES (?, ?, ?, ?)';
    
    connection.query(query, [nombre, disciplina, estado, disponible], (err, result) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al agregar articulo' 
            });
        }

        res.json({
            success: true,
            mensaje: 'Artículo agregado',
            id: result.insertId
        });
    });
});

//endpoint para elminar un artículo
app.delete('/api/articulo/:id', (req, res) => {
    console.log('📦 DELETE /api/articulo/:id - Params:', req.params);
    const { id } = req.params;

    const query = 'DELETE FROM material WHERE id = ?';

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('eli -- Error:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al eliminar artículo' 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Artículo no encontrado' 
            });
        }

        res.json({
            success: true,
            mensaje: 'Artículo eliminado'
        });
    });
});


//endpoint para editar un artículo
app.put('/api/articulo/:id', (req, res) => {
    console.log('📦 PUT /api/articulo/:id - Params:', req.params, 'Body:', req.body);
    const { id } = req.params;
    const { nombre, disciplina, estado, disponible } = req.body;    

    const query = 'UPDATE material SET nombre = ?, disciplina_id = ?, estado = ?, disponible = ? WHERE id = ?';

    connection.query(query, [nombre, disciplina, estado, disponible, id], (err, result) => {
        if (err) {
            console.error('edi -- Error:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al editar artículo' 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Artículo no encontrado' 
            });
        }

        res.json({
            success: true,
            mensaje: 'Artículo editado'
        });
    });
});

//consultar todos los artículos
app.get('/api/consultar/articulo', (req, res) => {
    console.log('📦 GET /api/consultar/articulo');

    const query = 'SELECT m.id, m.nombre AS nombre_material, d.nombre AS nombre_disciplina, m.tipoMaterial, m.estado, m.disponible FROM material m JOIN disciplina d ON m.disciplina_id = d.id';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al consultar artículos' 
            });
        }

        res.json({
            success: true,
            articulos: results
        });
    });
});

// Endpoint único para estadísticas
app.get('/api/totalArt', (req, res) => {
    console.log('📦 GET /api/totalArt');

    const query = `
        SELECT 
            COUNT(*) AS total, 
            SUM(CASE WHEN disponible = 1 THEN 1 ELSE 0 END) AS disponibles 
        FROM material
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al consultar estadísticas'
            });
        }

        const total = results[0].total || 0;
        const disponibles = results[0].disponibles || 0;
        
        res.json({
            success: true,
            total: total,
            disponibles: disponibles
        });
    });
});
 

// ============ ARCHIVOS ESTÁTICOS ============
// (DESPUÉS de todas las rutas API)
app.use(express.static(path.join(__dirname, '..')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '..')}`);
    console.log('\n📡 Rutas API disponibles:');
    console.log('   GET  /api/test');
    console.log('   POST /api/login');
    console.log('   POST /api/usuario');
    console.log('   GET  /api/consultar/articulo');
    console.log('   POST /api/articulo\n');
});     

