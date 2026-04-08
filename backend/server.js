const express = require('express');
const cors = require('cors');
const connection = require('./db'); // Esto es connection, no db
const path = require('path');
const { create } = require('domain');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = "tu_clave_secreta_super_segura";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ RUTAS API ============
// (TODAS las rutas API van ANTES de express.static)

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: 'No se envió token de autenticación (Authorization header).' });
    }

    const token = authHeader.split(' ')[1]; // El formato es "Bearer <token>"
    if (!token) return res.status(403).json({ success: false, message: 'Formato de token inválido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("❌ Token inválido o expirado");
            return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
        }
        req.userToken = decoded; // Pasamos los datos que iban en el token a la petición
        next();
    });
};

// Ruta de prueba (AHORA PROTEGIDA CON JWT)
app.get('/api/test', verificarToken, (req, res) => {
    console.log('✅ GET /api/test (Autorizado) - Token Decodificado:', req.userToken);
    res.json({
        success: true,
        message: '¡Petición segura conseguida! El servidor comprobó tu token correctamente.',
        datosDelToken: req.userToken
    });
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
        'SELECT identificador, nombre, apellidos, email, password, rol, telefono,estatus,created_at FROM usuario WHERE email = ? OR identificador = ? LIMIT 1',
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

                // Generamos nuestro Token JWT con los datos importantes del usuario
                const token = jwt.sign(
                    { id: usuario.id, rol: usuario.rol },
                    SECRET_KEY,
                    { expiresIn: '1h' } // El token expira en 1 hora
                );

                res.json({
                    success: true,
                    message: 'Sesión iniciada correctamente',
                    token: token, // <--- Aqui mandamos el token al frontend
                    user: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        apellidos: usuario.apellidos,
                        email: usuario.email,
                        password: usuario.password,
                        rol: usuario.rol,
                        telefono: usuario.telefono,
                        estatus: usuario.estatus,
                        create_at: usuario.created_at

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
//endpoint para consultar todos los usuarios registrados
app.get('/api/usuario', verificarToken, (req, res) => {
    console.log('📋 GET /api/usuario');

    const query = 'SELECT id, identificador, nombre, apellidos, email, telefono, rol, estatus, created_at FROM usuario';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al consultar usuarios'
            });
        }

        res.json({
            success: true,
            usuarios: results
        });
    });
});

//endpoint para eliminar un usuario por su ID
app.delete('/api/usuario/:id', verificarToken, (req, res) => {
    console.log('📦 DELETE /api/usuario/:id - Params:', req.params);
    const { id } = req.params;
    const query = 'DELETE FROM usuario WHERE id = ?';

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al eliminar usuario'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            mensaje: 'Usuario eliminado'
        });
    });
});

//endpoint para contar los usuarios
app.get('/api/usuario/num', verificarToken, (req, res) => {
    console.log(' GET /api/user/num');

    const query = 'SELECT COUNT(*) AS totalUser, SUM(CASE WHEN estatus = "Activo" THEN 1 ELSE 0 END) AS totalActivos, Sum(case when estatus = "Inactivo" then 1 else 0 end) as totalInactivos FROM usuario';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al consultar numero de usuarios'
            });
        }

        const total = results[0].totalUser || 0;

        res.json({
            success: true,
            total: total,
            activos: results[0].totalActivos || 0,
            inactivos: results[0].totalInactivos || 0
        });
    });
});




// insertar un nuevo ARTÍCULO
app.post('/api/articulo', verificarToken, (req, res) => {
    console.log('📦 POST /api/articulo - Body:', req.body);

    const { nombre, disciplina, estado, tipoMaterial } = req.body;

    if (!nombre || !disciplina) {
        return res.status(400).json({
            success: false,
            error: 'Campos obligatorios faltantes'
        });
    }

    const query = 'INSERT INTO material (nombre, disciplina_id, estado, tipoMaterial, disponible) VALUES (?, ?, ?, ?, "Libre")';

    connection.query(query, [nombre, disciplina, estado, tipoMaterial], (err, result) => {
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
app.delete('/api/articulo/:id', verificarToken, (req, res) => {
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
app.put('/api/articulo/:id', verificarToken, (req, res) => {
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
app.get('/api/consultar/articulo', verificarToken, (req, res) => {
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
app.get('/api/totalArt', verificarToken, (req, res) => {
    console.log('📦 GET /api/totalArt');

    const query = `
        SELECT 
            COUNT(*) AS total, 
            SUM(CASE WHEN disponible = "Libre" THEN 1 ELSE 0 END) AS disponibles 
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

