const express = require('express');
const cors = require('cors');
const connection = require('./db');
const path = require('path');
const jwt = require('jsonwebtoken');
const util = require('util');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3001;
const SECRET_KEY = "tu_clave_secreta_super_segura";

// Helper para usar promesas con la base de datos
const query = util.promisify(connection.query).bind(connection);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para Imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads/materials';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Asegurar que la columna 'imagen' exista en la tabla 'material'
(async () => {
    try {
        const columns = await query("SHOW COLUMNS FROM material LIKE 'imagen'");
        if (columns.length === 0) {
            await query("ALTER TABLE material ADD COLUMN imagen VARCHAR(255) DEFAULT NULL");
            console.log("✅ Columna 'imagen' agregada a la tabla material.");
        }

        const colsDisc = await query("SHOW COLUMNS FROM disciplina LIKE 'entrenador_id'");
        if (colsDisc.length === 0) {
            await query("ALTER TABLE disciplina ADD COLUMN entrenador_id INT DEFAULT NULL");
            await query("ALTER TABLE disciplina ADD CONSTRAINT fk_disciplina_entrenador FOREIGN KEY (entrenador_id) REFERENCES usuario(id)");
            console.log("✅ Columna 'entrenador_id' agregada a la tabla disciplina.");
        }

        const colsDesc = await query("SHOW COLUMNS FROM material LIKE 'descripcion'");
        if (colsDesc.length === 0) {
            await query("ALTER TABLE material ADD COLUMN descripcion TEXT DEFAULT NULL");
            console.log("✅ Columna 'descripcion' agregada a la tabla material.");
        }

        // Asegurar que el ENUM de estado incluya 'Eliminado'
        await query(`ALTER TABLE material MODIFY COLUMN estado ENUM('Nuevo','Bueno','Regular','Dañado','Mantenimiento','Eliminado') DEFAULT 'Bueno'`);
        console.log("✅ ENUM de estado en material actualizado.");

    } catch (err) {
        console.error("⚠️ Error verificando tablas:", err);
    }
})();

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

// ========================================================
// ============ AUTENTICACIÓN ============
// ========================================================

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

    connection.query(
        'SELECT identificador, nombre, apellidos, email, pass, rol, telefono,estatus,created_at, ubicacion, fecha_nacimiento FROM usuario WHERE email = ? OR identificador = ? LIMIT 1',
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

            if (password === usuario.pass) {

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
                        pass: usuario.pass,
                        rol: usuario.rol,
                        telefono: usuario.telefono,
                        estatus: usuario.estatus,
                        create_at: usuario.created_at,
                        ubicacion: usuario.ubicacion,
                        fecha_nacimiento: usuario.fecha_nacimiento
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

// REGISTRO de usuario con validación por Rol
app.post('/api/usuario', (req, res) => {
    console.log('📝 POST /api/usuario - Body:', req.body);

    let { identificador, nombres, apellidos, email, password, numero, rol } = req.body;

    if (!nombres || !email || !rol || !password) {
        return res.status(400).json({
            success: false,
            message: 'Campos obligatorios faltantes'
        });
    }

    // Lógica de validación de identificador (matrícula) por Rol
    if (rol === 'Alumno' && !identificador) {
        return res.status(400).json({
            success: false,
            message: 'La matrícula (identificador) es obligatoria para los estudiantes.'
        });
    }

    // Si es Administrador/Operador y no puso ID, lo generamos en base a un hash o prefijo
    if ((rol === 'Admin' || rol === 'Operador' || rol === 'Docente') && !identificador) {
        identificador = 'ADM-' + Date.now().toString().slice(-6);
    }

    const query = 'INSERT INTO usuario (identificador, nombre, apellidos, email, pass, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)';

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

//endpoint para EDITAR un usuario por su ID (Cambiado de DELETE a PUT por lógica de código)
app.put('/api/usuario/:id', verificarToken, async (req, res) => {
    console.log('📦 PUT /api/usuario/:id - Params:', req.params);
    const { id } = req.params;
    const { nombre, apellidos, email, rol } = req.body;

    try {
        const result = await query(
            'UPDATE usuario SET nombre = ?, apellidos = ?, email = ?, rol = ? WHERE id = ?',
            [nombre, apellidos, email, rol, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        res.json({ success: true, mensaje: 'Usuario actualizado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al editar usuario' });
    }
});

// GET historial prestamos del usuario actual
app.get('/api/perfil/historial', verificarToken, async (req, res) => {
    try {
        const userId = req.userToken.id;
        const q = `
            SELECT 
                p.id, p.fecha_solicitud, p.fecha_limite, p.fecha_entrega, p.estado_general, p.observaciones,
                GROUP_CONCAT(m.nombre SEPARATOR ', ') AS materiales
            FROM prestamo p
            LEFT JOIN detalle_prestamo pm ON p.id = pm.prestamo_id
            LEFT JOIN material m ON pm.material_id = m.id
            WHERE p.usuario_id = ?
            GROUP BY p.id
            ORDER BY p.fecha_solicitud DESC
        `;
        const prestamos = await query(q, [userId]);
        res.json({ success: true, prestamos });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
});

// CAMBIAR estatus de usuario (Activo/Sancionado)
app.put('/api/usuario/:id/estatus', async (req, res) => {
    const { id } = req.params;
    const { estatus, motivo_sancion } = req.body;

    try {
        await query('UPDATE usuario SET estatus = ?, motivo_sancion = ? WHERE id = ?',
            [estatus, estatus === 'Sancionado' ? (motivo_sancion || 'Sin especificar') : null, id]);
        res.json({ success: true, mensaje: `Estatus cambiado a ${estatus}` });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al cambiar estatus' });
    }
});

// CAMBIAR solo el ROL de usuario
app.put('/api/usuario/:id/rol', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    try {
        await query('UPDATE usuario SET rol = ? WHERE id = ?', [rol, id]);
        res.json({ success: true, mensaje: `Rol cambiado a ${rol}` });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al cambiar rol' });
    }
});

//endpoint para contar los usuarios
app.get('/api/usuario/num', verificarToken, (req, res) => {
    console.log(' GET /api/user/num');

    const query = 'SELECT COUNT(*) AS totalUser, SUM(CASE WHEN estatus = "Activo" THEN 1 ELSE 0 END) AS totalActivos, Sum(case when estatus = "Inactivo" then 1 else 0 end) as totalInactivos FROM usuario';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                error: 'Error al obtener conteo de usuarios'
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




// insertar un nuevo ARTÍCULO (Soporte Multiple Unidades + Imagen)
app.post('/api/articulo', verificarToken, upload.single('imagen'), async (req, res) => {
    let { nombre, disciplina, estado, tipoMaterial, cantidad, descripcionArticulo } = req.body;
    const imagen = req.file ? `/uploads/materials/${req.file.filename}` : null;

    if (!nombre || !disciplina) {
        return res.status(400).json({ success: false, error: 'Campos obligatorios faltantes' });
    }

    cantidad = parseInt(cantidad) || 1;
    if (cantidad < 1) cantidad = 1;

    try {
        const queryStr = 'INSERT INTO material (nombre, disciplina_id, estado, tipoMaterial, disponible, imagen, descripcion) VALUES (?, ?, ?, ?, "Libre", ?, ?)';
        
        let primerInsertId = null;
        for (let i = 0; i < cantidad; i++) {
            const resObj = await query(queryStr, [nombre, disciplina, estado, tipoMaterial, imagen, descripcionArticulo]);
            if (i === 0) primerInsertId = resObj.insertId;
        }

        res.json({
            success: true,
            mensaje: `Se agregaron ${cantidad} unidad(es) de ${nombre}`,
            id: primerInsertId
        });
    } catch (err) {
        console.error('❌ Error POST /api/articulo:', err);
        res.status(500).json({ success: false, error: 'Error al agregar articulos' });
    }
});

//endpoint para elminar un artículo (Soft Delete si tiene historial)
app.delete('/api/articulo/:id', verificarToken, async (req, res) => {
    console.log('📦 DELETE /api/articulo/:id - Params:', req.params, 'Query:', req.query);
    const { id } = req.params;
    const { cantidad } = req.query;

    try {
        // En lugar de borrar solo 1, debemos borrar el "grupo" o N elementos del grupo.
        // 1. Obtener características del artículo para identificar su grupo
        const articulos = await query('SELECT nombre, disciplina_id FROM material WHERE id = ?', [id]);
        if (articulos.length === 0) return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
        
        const { nombre, disciplina_id } = articulos[0];
        
        // 2. Buscar todos los IDs de ese grupo que no estén eliminados
        const grupo = await query('SELECT id FROM material WHERE nombre = ? AND disciplina_id = ? AND estado != "Eliminado" ORDER BY id ASC', [nombre, disciplina_id]);
        
        if (grupo.length === 0) return res.status(404).json({ success: false, error: 'Unidades no encontradas' });
        
        let idsABorrar = grupo.map(g => g.id);
        
        // Si no es "todas", limitamos la cantidad
        if (cantidad && cantidad !== 'todas') {
            const numLimit = parseInt(cantidad);
            if (!isNaN(numLimit) && numLimit > 0) {
                idsABorrar = idsABorrar.slice(0, numLimit);
            }
        }

        // 3. Revisar cuáles tienen historial
        const historiales = await query('SELECT material_id FROM detalle_prestamo WHERE material_id IN (?)', [idsABorrar]);
        const idsConHistorial = historiales.map(h => h.material_id);
        
        const idsSoftDelete = idsABorrar.filter(id => idsConHistorial.includes(id));
        const idsHardDelete = idsABorrar.filter(id => !idsConHistorial.includes(id));
        
        // Soft delete
        if (idsSoftDelete.length > 0) {
            await query('UPDATE material SET estado = "Eliminado" WHERE id IN (?)', [idsSoftDelete]);
        }
        
        // Hard delete
        if (idsHardDelete.length > 0) {
            await query('DELETE FROM material WHERE id IN (?)', [idsHardDelete]);
        }
        
        res.json({ success: true, mensaje: `Se eliminaron ${idsABorrar.length} unidades del artículo.` });
    } catch (err) {
        console.error('❌ Error en DELETE /api/articulo:', err);
        res.status(500).json({ success: false, error: 'Error interno al procesar el borrado' });
    }
});


// Obtener un solo artículo por ID
app.get('/api/articulo/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query('SELECT * FROM material WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
        res.json({ success: true, articulo: results[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al obtener artículo' });
    }
});

// Actualizar artículo (Soporte para Imagen + Actualización por grupo)
app.put('/api/articulo/:id', verificarToken, upload.single('imagen'), async (req, res) => {
    console.log('📦 PUT /api/articulo/:id - Params:', req.params, 'Body:', req.body);
    const { id } = req.params;
    const { nombre, disciplina_id, estado, tipoMaterial, descripcion } = req.body;
    const nuevaImagen = req.file ? `/uploads/materials/${req.file.filename}` : null;

    try {
        // Obtenemos los datos actuales por si no se sube imagen nueva
        const actual = await query('SELECT nombre, disciplina_id, imagen FROM material WHERE id = ?', [id]);
        if (actual.length === 0) return res.status(404).json({ success: false, error: 'Artículo no encontrado' });

        const { nombre: oldNombre, disciplina_id: oldDisc, imagen: oldImg } = actual[0];
        const finalImg = nuevaImagen || oldImg;

        // Actualizamos TODOS los materiales que compartan el mismo Nombre y Disciplina original
        // Esto mantiene la consistencia del catálogo agrupado
        const updateSql = `
            UPDATE material 
            SET nombre = ?, disciplina_id = ?, estado = ?, tipoMaterial = ?, imagen = ?, descripcion = ?
            WHERE nombre = ? AND disciplina_id = ? AND estado != 'Eliminado'
        `;
        
        await query(updateSql, [
            nombre, 
            disciplina_id, 
            estado, 
            tipoMaterial, 
            finalImg, 
            descripcion,
            oldNombre,
            oldDisc
        ]);

        res.json({ success: true, mensaje: 'Material(es) actualizado(s) correctamente' });
    } catch (err) {
        console.error('❌ Error PUT /api/articulo:', err);
        res.status(500).json({ success: false, error: 'Error al actualizar material' });
    }
});

//endpoint para editar un artículo (Historia de préstamos)
app.get('/api/perfil/historial', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.userToken.id; 
        const sql = `
            SELECT 
                p.id, p.fecha_solicitud, p.fecha_limite, 
                MAX(pm.fecha_entrega_real) as fecha_entrega, 
                p.estado_general, p.observaciones,
                GROUP_CONCAT(m.nombre SEPARATOR ', ') AS materiales
            FROM prestamo p
            LEFT JOIN detalle_prestamo pm ON p.id = pm.prestamo_id
            LEFT JOIN material m ON pm.material_id = m.id
            WHERE p.usuario_id = ?
            GROUP BY p.id
            ORDER BY p.fecha_solicitud DESC
        `;
        const results = await query(sql, [usuario_id]);
        res.json({ success: true, prestamos: results });
    } catch (err) {
        console.error('❌ Error Historial:', err);
        res.status(500).json({ success: false, error: 'Error al consultar historial' });
    }
});

//consultar todos los artículos (Catálogo Inteligente Agrupado)
app.get('/api/consultar/articulo', verificarToken, (req, res) => {
    console.log('📦 GET /api/consultar/articulo (Agrupado por Modelo/Unidades)');

    // Consulta SQL mejorada: Filtra Eliminados, cuenta agrupando, devuelve Imagen
    const query = `
        SELECT 
            m.nombre AS nombre_material, 
            d.nombre AS nombre_disciplina, 
            m.tipoMaterial,
            m.estado,
            m.imagen,
            m.descripcion,
            COUNT(*) AS total_unidades,
            SUM(CASE WHEN m.disponible = 'Libre' THEN 1 ELSE 0 END) AS unidades_disponibles,
            MIN(m.id) as id_representativo
        FROM material m 
        LEFT JOIN disciplina d ON m.disciplina_id = d.id
        WHERE m.estado != 'Eliminado'
        GROUP BY m.nombre, m.tipoMaterial, d.nombre, m.estado, m.imagen, m.descripcion
    `;

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
            COUNT(DISTINCT CONCAT_WS('||', m.nombre, m.disciplina_id, m.tipoMaterial, m.estado, IFNULL(m.imagen, ''), IFNULL(m.descripcion, ''))) AS total,
            SUM(CASE WHEN m.disponible = 'Libre' THEN 1 ELSE 0 END) AS sum_disponibles,
            SUM(CASE WHEN m.disponible != 'Libre' THEN 1 ELSE 0 END) AS sum_ocupados,
            COUNT(DISTINCT CASE WHEN m.disponible = 'Libre' THEN CONCAT_WS('||', m.nombre, m.disciplina_id, m.tipoMaterial, m.estado, IFNULL(m.imagen, ''), IFNULL(m.descripcion, '')) ELSE NULL END) AS disponibles,
            COUNT(DISTINCT CASE WHEN m.disponible != 'Libre' THEN CONCAT_WS('||', m.nombre, m.disciplina_id, m.tipoMaterial, m.estado, IFNULL(m.imagen, ''), IFNULL(m.descripcion, '')) ELSE NULL END) AS ocupados
        FROM material m
        WHERE m.estado != 'Eliminado'
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al consultar estadísticas'
            });
        }

        // Ajustamos para que 'Total' cuente filas visibles (Tipos de material)
        const total = results[0].total || 0;
        const disponibles = results[0].disponibles || 0; // Tipos disponibles
        const ocupados = results[0].ocupados || 0;      // Tipos ocupados

        res.json({
            success: true,
            total,
            disponibles,
            ocupados
        });
    });
});

// ========================================================
// ============ RESERVAS ============
// ========================================================

// Crear una reserva con validación ANTISOLAPAMIENTO
app.post('/api/reserva', verificarToken, async (req, res) => {
    console.log('📝 POST /api/reserva - Body:', req.body);
    const { espacio_id, inicio, fin, motivo } = req.body;
    const usuario_id = req.userToken.id; // Tomado del token directamente por seguridad

    if (!espacio_id || !inicio || !fin || !motivo) {
        return res.status(400).json({ success: false, message: 'Faltan datos para la reserva' });
    }

    try {
        const checkQuery = `
            SELECT id FROM reserva 
            WHERE espacio_id = ? 
            AND estatus IN ('Pendiente', 'Confirmada')
            AND (
                (? BETWEEN inicio AND fin) OR 
                (? BETWEEN inicio AND fin) OR
                (inicio BETWEEN ? AND ?)
            )
        `;
        const resCheck = await query(checkQuery, [inicio, fin, inicio, fin]);

        if (resCheck.length > 0) {
            return res.status(409).json({ success: false, message: 'El horario solicitado choca con una reserva existente o pendiente.' });
        }

        const insertQuery = "INSERT INTO reserva (espacio_id, usuario_id, inicio, fin, motivo, estatus) VALUES (?, ?, ?, ?, ?, 'Pendiente')";
        const result = await query(insertQuery, [espacio_id, usuario_id, inicio, fin, motivo]);

        res.json({ success: true, message: 'Reserva solicitada correctamente.', id: result.insertId });

    } catch (err) {
        console.error('❌ Error Reserva:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor al procesar reserva' });
    }
});

// Consultar horarios ocupados de un espacio específico en una fecha para filtrado en UI
app.get('/api/reserva/ocupados/:espacio_id/:fecha', verificarToken, async (req, res) => {
    const { espacio_id, fecha } = req.params;
    try {
        const sql = `
            SELECT DATE_FORMAT(inicio, '%H:%i') as inicio, DATE_FORMAT(fin, '%H:%i') as fin 
            FROM reserva 
            WHERE espacio_id = ? 
            AND estatus IN ('Pendiente', 'Confirmada') 
            AND DATE(inicio) = ?
        `;
        const ocupados = await query(sql, [espacio_id, fecha]);
        res.json({ success: true, ocupados });
    } catch (err) {
        console.error('❌ Error Filtros:', err);
        res.status(500).json({ success: false, message: 'Error al consultar horarios ocupados' });
    }
});

// ========================================================
// ============ EVENTOS ============
// ========================================================

app.post('/api/evento', verificarToken, async (req, res) => {
    console.log('📝 POST /api/evento - Body:', req.body);
    const { titulo, descripcion, fecha, hora, hora_fin, ubicacion } = req.body;

    if (!titulo || !fecha || !hora || !hora_fin) {
        return res.status(400).json({ success: false, message: 'Título, fecha, hora_inicio y hora_fin son obligatorios.' });
    }

    if (hora_fin <= hora) {
        return res.status(400).json({ success: false, message: 'La hora de fin debe ser posterior a la hora de inicio.' });
    }

    try {
        const sql = "INSERT INTO evento (titulo, descripcion, fecha, hora, hora_fin, ubicacion, estatus) VALUES (?, ?, ?, ?, ?, ?, 'Activo')";
        const result = await query(sql, [titulo, descripcion, fecha, hora, hora_fin, ubicacion]);
        res.json({ success: true, message: 'Evento registrado con duración definida.', id: result.insertId });
    } catch (err) {
        console.error('❌ Error Evento:', err);
        res.status(500).json({ success: false, message: 'Error interno al registrar el evento.' });
    }
});

app.get('/api/evento', verificarToken, async (req, res) => {
    try {
        const eventos = await query("SELECT id, titulo, descripcion, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, TIME_FORMAT(hora, '%H:%i') as hora_inicio, TIME_FORMAT(hora_fin, '%H:%i') as hora_fin, ubicacion, estatus FROM evento");
        res.json({ success: true, eventos });
    } catch (err) {
        console.error('❌ Error Eventos:', err);
        res.status(500).json({ success: false, message: 'Error al listar eventos' });
    }
});
// ========================================================
// ============ ENTRENADORES (DOCENTES) ============
// ========================================================

app.get('/api/entrenador', verificarToken, async (req, res) => {
    try {
        const entrenadores = await query(`
            SELECT id, nombre, apellidos, telefono, email, estatus 
            FROM usuario 
            WHERE rol IN ('Docente', 'Entrenador')
        `);
        res.json({ success: true, entrenadores });
    } catch (err) {
        console.error('❌ Error Entrenadores:', err);
        res.status(500).json({ success: false, message: 'Error al listar entrenadores' });
    }
});

// CRUD Disciplinas
app.get('/api/disciplina', verificarToken, async (req, res) => {
    try {
        const sql = `
            SELECT d.id, d.nombre, u.nombre AS entrenador_nombre, u.apellidos AS entrenador_apellidos 
            FROM disciplina d
            LEFT JOIN usuario u ON d.entrenador_id = u.id
        `;
        const results = await query(sql);
        res.json({ success: true, disciplinas: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al obtener disciplinas' });
    }
});

app.post('/api/disciplina', verificarToken, async (req, res) => {
    const { nombre, entrenador_id } = req.body;
    try {
        await query('INSERT INTO disciplina (nombre, entrenador_id) VALUES (?, ?)', [nombre, entrenador_id || null]);
        res.json({ success: true, mensaje: 'Disciplina creada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al crear disciplina' });
    }
});

app.delete('/api/disciplina/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM disciplina WHERE id = ?', [id]);
        res.json({ success: true, mensaje: 'Disciplina eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'La disciplina tiene materiales vinculados y no puede eliminarse' });
    }
});

// endpoint para obtener entrenadores ACTIVOS (para selects)
app.get('/api/entrenador/activos', verificarToken, async (req, res) => {
    try {
        const results = await query('SELECT id, nombre, apellidos FROM usuario WHERE rol IN ("Docente", "Entrenador") AND estatus = "Activo"');
        res.json({ success: true, entrenadores: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al obtener entrenadores' });
    }
});

// ============ ARCHIVOS ESTÁTICOS ============
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '..')}`);
    console.log('\n📡 Rutas API disponibles:');
    console.log('   POST /api/login');
    console.log('   POST /api/usuario');
    console.log('   GET  /api/consultar/articulo');
    console.log('   POST /api/articulo\n');
});

