const express = require('express');
const cors = require('cors');
const connection = require('./db'); // Esto es connection, no db
const path = require('path');
const { create } = require('domain');

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
app.get('/api/usuario', (req, res) => {
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
app.delete('/api/usuario/:id', (req, res) => {
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
app.get('/api/usuario/num', (req, res)=> {
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
app.post('/api/articulo', (req, res) => {
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
 

// ============ CRUD DE PRÉSTAMOS ============

// Consultar TODOS los préstamos (JOIN prestamo + detalle_prestamo + usuario + material)
app.get('/api/prestamo', (req, res) => {
    console.log('📦 GET /api/prestamo');

    const query = `
        SELECT 
            p.id,
            p.usuario_id,
            u.nombre AS usuario_nombre,
            u.apellidos AS usuario_apellidos,
            u.identificador AS usuario_matricula,
            dp.material_id,
            m.nombre AS material_nombre,
            p.fecha_solicitud,
            p.fecha_limite,
            p.estado_general,
            dp.estado_devolucion,
            dp.fecha_entrega_real,
            p.observaciones
        FROM prestamo p
        JOIN usuario u ON p.usuario_id = u.id
        LEFT JOIN detalle_prestamo dp ON dp.prestamo_id = p.id
        LEFT JOIN material m ON dp.material_id = m.id
        ORDER BY p.id DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ success: false, error: 'Error al consultar préstamos' });
        }
        res.json({ success: true, prestamos: results });
    });
});

// Estadísticas de préstamos (KPIs)
app.get('/api/prestamo/stats', (req, res) => {
    console.log('📊 GET /api/prestamo/stats');

    const query = `
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN estado_general = 'Abierto' THEN 1 ELSE 0 END) AS abiertos,
            SUM(CASE WHEN estado_general = 'Retraso' THEN 1 ELSE 0 END) AS retraso,
            SUM(CASE WHEN estado_general = 'Cerrado' THEN 1 ELSE 0 END) AS cerrados
        FROM prestamo
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ success: false, error: 'Error al consultar estadísticas' });
        }
        const stats = results[0];
        res.json({
            success: true,
            total: stats.total || 0,
            abiertos: stats.abiertos || 0,
            retraso: stats.retraso || 0,
            cerrados: stats.cerrados || 0
        });
    });
});

// Crear un nuevo préstamo (INSERT en prestamo + detalle_prestamo)
app.post('/api/prestamo', (req, res) => {
    console.log('📦 POST /api/prestamo - Body:', req.body);

    const { usuario_id, material_id, fecha_limite, observaciones } = req.body;

    if (!usuario_id || !material_id || !fecha_limite) {
        return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes (usuario, material, fecha límite)' });
    }

    // 1. Insertar en tabla prestamo
    const queryPrestamo = `INSERT INTO prestamo (usuario_id, fecha_solicitud, fecha_limite, estado_general, observaciones) VALUES (?, NOW(), ?, 'Abierto', ?)`;

    connection.query(queryPrestamo, [usuario_id, fecha_limite, observaciones || ''], (err, result) => {
        if (err) {
            console.error('❌ Error al crear préstamo:', err);
            return res.status(500).json({ success: false, error: 'Error al crear préstamo: ' + err.message });
        }

        const prestamoId = result.insertId;

        // 2. Insertar en tabla detalle_prestamo
        const queryDetalle = `INSERT INTO detalle_prestamo (prestamo_id, material_id, estado_devolucion) VALUES (?, ?, 'Pendiente')`;

        connection.query(queryDetalle, [prestamoId, material_id], (err2) => {
            if (err2) {
                console.error('❌ Error al crear detalle:', err2);
                return res.status(500).json({ success: false, error: 'Error al crear detalle: ' + err2.message });
            }

            // 3. Marcar material como Ocupado
            connection.query(`UPDATE material SET disponible = 'Ocupado' WHERE id = ?`, [material_id], (err3) => {
                if (err3) console.error('⚠️ No se pudo actualizar material:', err3);

                res.json({
                    success: true,
                    mensaje: 'Préstamo registrado correctamente',
                    id: prestamoId
                });
            });
        });
    });
});

// Editar un préstamo existente
app.put('/api/prestamo/:id', (req, res) => {
    console.log('📦 PUT /api/prestamo/:id - Params:', req.params, 'Body:', req.body);

    const { id } = req.params;
    const { estado_general, estado_devolucion, fecha_entrega_real, observaciones } = req.body;

    // Actualizar tabla prestamo
    const queryPrestamo = `UPDATE prestamo SET estado_general = ?, observaciones = ? WHERE id = ?`;

    connection.query(queryPrestamo, [estado_general, observaciones, id], (err) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ success: false, error: 'Error al editar préstamo' });
        }

        // Actualizar tabla detalle_prestamo
        const queryDetalle = `UPDATE detalle_prestamo SET estado_devolucion = ?, fecha_entrega_real = ? WHERE prestamo_id = ?`;
        const fechaEntrega = fecha_entrega_real || null;

        connection.query(queryDetalle, [estado_devolucion, fechaEntrega, id], (err2) => {
            if (err2) {
                console.error('❌ Error detalle:', err2);
                return res.status(500).json({ success: false, error: 'Error al editar detalle' });
            }

            // Si el estado de devolución es "Entregado", liberar el material
            if (estado_devolucion === 'Entregado') {
                connection.query(
                    `UPDATE material SET disponible = 'Libre' WHERE id = (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ? LIMIT 1)`,
                    [id],
                    () => {} // fire and forget
                );
            }

            res.json({ success: true, mensaje: 'Préstamo actualizado' });
        });
    });
});

// Eliminar un préstamo
app.delete('/api/prestamo/:id', (req, res) => {
    console.log('📦 DELETE /api/prestamo/:id - Params:', req.params);
    const { id } = req.params;

    // Primero liberar el material
    connection.query(
        `UPDATE material SET disponible = 'Libre' WHERE id = (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ? LIMIT 1)`,
        [id],
        () => {
            // Luego eliminar detalle
            connection.query(`DELETE FROM detalle_prestamo WHERE prestamo_id = ?`, [id], (err) => {
                if (err) {
                    console.error('❌ Error:', err);
                    return res.status(500).json({ success: false, error: 'Error al eliminar detalle' });
                }

                // Finalmente eliminar préstamo
                connection.query(`DELETE FROM prestamo WHERE id = ?`, [id], (err2, result) => {
                    if (err2) {
                        console.error('❌ Error:', err2);
                        return res.status(500).json({ success: false, error: 'Error al eliminar préstamo' });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
                    }
                    res.json({ success: true, mensaje: 'Préstamo eliminado' });
                });
            });
        }
    );
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

