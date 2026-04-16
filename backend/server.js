const express = require('express');
const cors = require('cors');
const connection = require('./db');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ UTILIDAD: Promisify queries ============
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// ============ RUTA DE PRUEBA ============
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando' });
});

// ========================================================
// ============ AUTENTICACIÓN ============
// ========================================================


// LOGIN
app.post('/api/login', async (req, res) => {
    console.log('🔐 POST /api/login');
    const { credencial, password } = req.body;

    if (!credencial || !password) {
        return res.status(400).json({ success: false, message: 'Faltan credenciales o contraseña' });
    }

    try {
        const rows = await query(
            'SELECT id, identificador, nombre, apellidos, email, password, rol, telefono, estatus, motivo_sancion, es_frecuente, created_at FROM usuario WHERE email = ? OR identificador = ? LIMIT 1',
            [credencial, credencial]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'El usuario no existe.' });
        }

        const usuario = rows[0];

        // Intentar comparar con bcrypt primero, luego texto plano (migración)
        let passwordMatch = false;

        if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
            // La contraseña en BD ya está hasheada
            passwordMatch = await bcrypt.compare(password, usuario.password);
        } else {
            // La contraseña en BD está en texto plano
            passwordMatch = (password === usuario.password);

            // Si coincide en texto plano, migrar a bcrypt automáticamente
            if (passwordMatch) {
                const hash = await bcrypt.hash(password, SALT_ROUNDS);
                await query('UPDATE usuario SET password = ? WHERE id = ?', [hash, usuario.id]);
                console.log(`🔄 Contraseña migrada a bcrypt para usuario ${usuario.id}`);
            }
        }

        if (passwordMatch) {
            res.json({
                success: true,
                message: 'Sesión iniciada correctamente',
                user: {
                    id: usuario.id,
                    identificador: usuario.identificador,
                    nombre: usuario.nombre,
                    apellidos: usuario.apellidos,
                    email: usuario.email,
                    rol: usuario.rol,
                    telefono: usuario.telefono,
                    estatus: usuario.estatus,
                    motivo_sancion: usuario.motivo_sancion,
                    es_frecuente: usuario.es_frecuente,
                    created_at: usuario.created_at
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'La contraseña es incorrecta.' });
        }
    } catch (err) {
        console.error('❌ Error login:', err);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});

// ========================================================
// ============ CRUD DE USUARIOS ============
// ========================================================

// REGISTRAR usuario (con bcrypt)
app.post('/api/usuario', async (req, res) => {
    console.log('📝 POST /api/usuario');
    const { identificador, nombres, apellidos, email, password, numero, rol } = req.body;

    if (!nombres || !email || !rol || !password) {
        return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' });
    }

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await query(
            'INSERT INTO usuario (identificador, nombre, apellidos, email, password, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [identificador, nombres, apellidos, email, hash, numero, rol]
        );
        res.json({ success: true, mensaje: 'Usuario registrado', id: result.insertId });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, message: 'Error al registrar usuario: ' + err.message });
    }
});

// LISTAR todos los usuarios
app.get('/api/usuario', async (req, res) => {
    try {
        const results = await query('SELECT id, identificador, nombre, apellidos, email, telefono, rol, estatus, motivo_sancion, created_at FROM usuario');
        res.json({ success: true, usuarios: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar usuarios' });
    }
});

// ESTADÍSTICAS de usuarios
app.get('/api/usuario/num', async (req, res) => {
    try {
        const results = await query(`
            SELECT COUNT(*) AS totalUser,
                SUM(CASE WHEN estatus = 'Activo' THEN 1 ELSE 0 END) AS totalActivos,
                SUM(CASE WHEN estatus = 'Sancionado' THEN 1 ELSE 0 END) AS totalSancionados,
                SUM(CASE WHEN estatus NOT IN ('Activo','Sancionado') THEN 1 ELSE 0 END) AS totalOtros
            FROM usuario
        `);
        const r = results[0];
        res.json({
            success: true,
            total: Number(r.totalUser) || 0,
            activos: Number(r.totalActivos) || 0,
            inactivos: Number(r.totalSancionados) || 0,
            sancionados: Number(r.totalSancionados) || 0
        });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar estadísticas' });
    }
});

// EDITAR usuario completo (nombre, apellidos, email, rol)
app.put('/api/usuario/:id', async (req, res) => {
    console.log('📝 PUT /api/usuario/:id');
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

// ELIMINAR usuario (verificar préstamos activos)
app.delete('/api/usuario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar préstamos activos
        const prestamos = await query(
            "SELECT COUNT(*) AS count FROM prestamo WHERE usuario_id = ? AND estado_general IN ('Pendiente','Abierto','Activo','Renovado')",
            [id]
        );
        if (prestamos[0].count > 0) {
            return res.status(400).json({
                success: false,
                error: `No se puede eliminar: el usuario tiene ${prestamos[0].count} préstamo(s) activo(s)`
            });
        }

        const result = await query('DELETE FROM usuario WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        res.json({ success: true, mensaje: 'Usuario eliminado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
    }
});

// SANCIONAR usuario desde un préstamo
app.put('/api/usuario/:id/sancionar', async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
        await query("UPDATE usuario SET estatus = 'Sancionado', motivo_sancion = ? WHERE id = ?",
            [motivo || 'Sancionado por préstamo', id]);
        res.json({ success: true, mensaje: 'Usuario sancionado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al sancionar usuario' });
    }
});

// ========================================================
// ============ CRUD DE MATERIALES ============
// ========================================================

// CREAR material
app.post('/api/articulo', async (req, res) => {
    console.log('📦 POST /api/articulo');
    const { nombre, disciplina, estado, tipoMaterial, cantidad, descripcion } = req.body;

    if (!nombre || !disciplina) {
        return res.status(400).json({ success: false, error: 'Campos obligatorios faltantes' });
    }

    try {
        const result = await query(
            'INSERT INTO material (nombre, disciplina_id, estado, tipoMaterial, disponible, cantidad, descripcion) VALUES (?, ?, ?, ?, 1, ?, ?)',
            [nombre, disciplina, estado, tipoMaterial, cantidad || 1, descripcion || null]
        );
        res.json({ success: true, mensaje: 'Artículo agregado', id: result.insertId });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al agregar articulo: ' + err.message });
    }
});

// ELIMINAR material
app.delete('/api/articulo/:id', async (req, res) => {
    const { id } = req.params;
    const forzar = req.query.forzar === 'true'; // ?forzar=true para eliminar con historial

    try {
        // Verificar si el material está referenciado en detalle_prestamo
        const refs = await query(
            'SELECT COUNT(*) AS total FROM detalle_prestamo WHERE material_id = ?', [id]
        );

        if (refs[0].total > 0 && !forzar) {
            // Verificar si tiene préstamos ACTIVOS (no cerrados)
            const activos = await query(
                `SELECT COUNT(*) AS total FROM detalle_prestamo dp 
                 JOIN prestamo p ON dp.prestamo_id = p.id 
                 WHERE dp.material_id = ? AND p.estado_general IN ('Pendiente','Abierto','Activo','Renovado')`, [id]
            );

            if (activos[0].total > 0) {
                return res.status(400).json({
                    success: false,
                    error: `No se puede eliminar: este material tiene ${activos[0].total} préstamo(s) activo(s). Finaliza los préstamos primero.`
                });
            }

            // Tiene historial pero no préstamos activos — pedir confirmación
            return res.status(409).json({
                success: false,
                requiereForzar: true,
                error: `Este material tiene ${refs[0].total} registro(s) en el historial de préstamos. ¿Deseas eliminarlo junto con su historial?`
            });
        }

        // Si forzar=true, eliminar primero los registros de detalle_prestamo
        if (forzar && refs[0].total > 0) {
            await query('DELETE FROM detalle_prestamo WHERE material_id = ?', [id]);
        }

        const result = await query('DELETE FROM material WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
        res.json({ success: true, mensaje: 'Artículo eliminado correctamente' });
    } catch (err) {
        console.error('❌ Error al eliminar material:', err.message);
        res.status(500).json({ success: false, error: 'Error interno del servidor: ' + err.message });
    }
});

// EDITAR material
app.put('/api/articulo/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, disciplina, estado, disponible, cantidad, descripcion } = req.body;

    try {
        const result = await query(
            'UPDATE material SET nombre = ?, disciplina_id = ?, estado = ?, disponible = ?, cantidad = ?, descripcion = ? WHERE id = ?',
            [nombre, disciplina, estado, disponible, cantidad || 1, descripcion || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
        res.json({ success: true, mensaje: 'Artículo editado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al editar artículo' });
    }
});

// LISTAR todos los materiales
app.get('/api/consultar/articulo', async (req, res) => {
    try {
        const results = await query(
            'SELECT m.id, m.nombre AS nombre_material, d.nombre AS nombre_disciplina, m.tipoMaterial, m.estado, m.disponible, m.cantidad, m.descripcion FROM material m LEFT JOIN disciplina d ON m.disciplina_id = d.id'
        );
        res.json({ success: true, articulos: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar artículos' });
    }
});

// MATERIALES DISPONIBLES (solo los libres, para selects)
app.get('/api/articulo/disponibles', async (req, res) => {
    try {
        const results = await query(
            'SELECT m.id, m.nombre AS nombre_material, d.nombre AS nombre_disciplina, m.estado FROM material m LEFT JOIN disciplina d ON m.disciplina_id = d.id WHERE m.disponible = 1'
        );
        res.json({ success: true, materiales: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar materiales disponibles' });
    }
});

// ESTADÍSTICAS de materiales
app.get('/api/totalArt', async (req, res) => {
    try {
        const results = await query(`
            SELECT COUNT(*) AS total, SUM(CASE WHEN disponible = 1 THEN 1 ELSE 0 END) AS disponibles FROM material
        `);
        res.json({ success: true, total: results[0].total || 0, disponibles: results[0].disponibles || 0 });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar estadísticas' });
    }
});

// ========================================================
// ============ CRUD DE PRÉSTAMOS ============
// ========================================================

// LISTAR todos los préstamos (JOIN completo)
app.get('/api/prestamo', async (req, res) => {
    try {
        const results = await query(`
            SELECT 
                p.id, p.usuario_id,
                u.nombre AS usuario_nombre, u.apellidos AS usuario_apellidos, u.identificador AS usuario_matricula,
                p.fecha_solicitud, p.fecha_limite, p.fecha_entrega, p.estado_general, p.observaciones,
                GROUP_CONCAT(m.nombre SEPARATOR ', ') AS materiales,
                GROUP_CONCAT(m.id SEPARATOR ',') AS material_ids,
                GROUP_CONCAT(IFNULL(dp.estado_devolucion,'') SEPARATOR ', ') AS estados_devolucion,
                GROUP_CONCAT(IFNULL(dp.fecha_entrega_real,'') SEPARATOR ', ') AS fechas_entrega_real
            FROM prestamo p
            JOIN usuario u ON p.usuario_id = u.id
            LEFT JOIN detalle_prestamo dp ON dp.prestamo_id = p.id
            LEFT JOIN material m ON dp.material_id = m.id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);
        res.json({ success: true, prestamos: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar préstamos' });
    }
});

// DETALLE de un préstamo
app.get('/api/prestamo/:id/detalle', async (req, res) => {
    const { id } = req.params;
    try {
        const prestamo = await query(`
            SELECT p.*, u.nombre AS usuario_nombre, u.apellidos AS usuario_apellidos, u.identificador AS usuario_matricula
            FROM prestamo p JOIN usuario u ON p.usuario_id = u.id WHERE p.id = ?`, [id]);
        const detalles = await query(`
            SELECT dp.*, m.nombre AS material_nombre, m.estado AS material_estado
            FROM detalle_prestamo dp JOIN material m ON dp.material_id = m.id WHERE dp.prestamo_id = ?`, [id]);

        if (prestamo.length === 0) return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
        res.json({ success: true, prestamo: prestamo[0], detalles });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al obtener detalle' });
    }
});

// ESTADÍSTICAS de préstamos (KPIs)
app.get('/api/prestamo/stats', async (req, res) => {
    try {
        const results = await query(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN estado_general IN ('Abierto','Activo','Renovado') THEN 1 ELSE 0 END) AS abiertos,
                SUM(CASE WHEN estado_general = 'Vencido' OR (estado_general IN ('Abierto','Activo','Renovado') AND fecha_limite < NOW()) THEN 1 ELSE 0 END) AS retraso,
                SUM(CASE WHEN estado_general IN ('Cerrado','Finalizado','Entregado','Devuelto') THEN 1 ELSE 0 END) AS cerrados,
                SUM(CASE WHEN estado_general IN ('Abierto','Activo','Renovado') AND DATE(fecha_limite) = CURDATE() THEN 1 ELSE 0 END) AS vencen_hoy,
                SUM(CASE WHEN estado_general IN ('Abierto','Activo','Renovado') AND fecha_limite < NOW() THEN 1 ELSE 0 END) AS vencidos_real
            FROM prestamo
        `);
        const s = results[0];
        res.json({
            success: true,
            total: Number(s.total) || 0, abiertos: Number(s.abiertos) || 0, retraso: Number(s.retraso) || 0,
            cerrados: Number(s.cerrados) || 0, vencen_hoy: Number(s.vencen_hoy) || 0, vencidos_real: Number(s.vencidos_real) || 0
        });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar estadísticas' });
    }
});

// VERIFICAR conflictos de fechas (endpoint auxiliar)
app.post('/api/prestamo/verificar-conflicto', async (req, res) => {
    const { material_ids, fecha_limite } = req.body;
    const materiales = Array.isArray(material_ids) ? material_ids : (material_ids ? [material_ids] : []);
    if (materiales.length === 0 || !fecha_limite) {
        return res.json({ success: true, conflictos: [] });
    }
    try {
        const placeholders = materiales.map(() => '?').join(',');
        const conflictos = await query(`
            SELECT m.nombre AS material_nombre, m.tipoMaterial,
                   p.id AS prestamo_id, p.fecha_limite,
                   u.nombre AS usuario_nombre, u.apellidos AS usuario_apellidos
            FROM detalle_prestamo dp
            JOIN material m ON dp.material_id = m.id
            JOIN prestamo p ON dp.prestamo_id = p.id
            JOIN usuario u ON p.usuario_id = u.id
            WHERE dp.material_id IN (${placeholders})
              AND p.estado_general IN ('Pendiente','Abierto','Activo','Renovado')
              AND p.fecha_limite >= NOW()
        `, materiales);
        res.json({ success: true, conflictos });
    } catch (err) {
        console.error('❌ Error verificando conflictos:', err);
        res.status(500).json({ success: false, error: 'Error al verificar conflictos' });
    }
});

// CREAR préstamo (multi-material)
app.post('/api/prestamo', async (req, res) => {
    console.log('📦 POST /api/prestamo');
    const { usuario_id, material_ids, fecha_limite, observaciones } = req.body;
    // material_ids puede ser un array [1,2,3] o un solo valor (backward compat)
    const materiales = Array.isArray(material_ids) ? material_ids : (req.body.material_id ? [req.body.material_id] : []);

    if (!usuario_id || materiales.length === 0 || !fecha_limite) {
        return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes (usuario, material(es), fecha límite)' });
    }

    try {
        // 1. Verificar conflictos de fechas: ¿alguno de estos materiales ya está activo en una reserva?
        const placeholders = materiales.map(() => '?').join(',');
        const conflictos = await query(`
            SELECT m.nombre AS material_nombre, m.tipoMaterial,
                   p.id AS prestamo_id, p.fecha_limite,
                   u.nombre AS usuario_nombre, u.apellidos AS usuario_apellidos
            FROM detalle_prestamo dp
            JOIN material m ON dp.material_id = m.id
            JOIN prestamo p ON dp.prestamo_id = p.id
            JOIN usuario u ON p.usuario_id = u.id
            WHERE dp.material_id IN (${placeholders})
              AND p.estado_general IN ('Pendiente','Abierto','Activo','Renovado')
              AND p.fecha_limite >= NOW()
        `, materiales);

        if (conflictos.length > 0) {
            return res.status(409).json({
                success: false,
                conflicto: true,
                message: 'Uno o más materiales ya están reservados en ese período.',
                conflictos: conflictos.map(c => ({
                    material: c.material_nombre,
                    tipo: c.tipoMaterial,
                    prestamo_id: c.prestamo_id,
                    reservado_hasta: c.fecha_limite,
                    reservado_por: `${c.usuario_nombre} ${c.usuario_apellidos || ''}`
                }))
            });
        }

        // 2. Verificar que TODOS los materiales estén disponibles (estado binario)
        const disponibles = await query(
            `SELECT id FROM material WHERE id IN (${placeholders}) AND disponible = 1`,
            materiales
        );
        if (disponibles.length !== materiales.length) {
            return res.status(400).json({ success: false, message: 'Uno o más materiales no están disponibles actualmente' });
        }

        // 3. Insertar préstamo
        const result = await query(
            "INSERT INTO prestamo (usuario_id, fecha_solicitud, fecha_limite, estado_general, observaciones) VALUES (?, NOW(), ?, 'Activo', ?)",
            [usuario_id, fecha_limite, observaciones || '']
        );
        const prestamoId = result.insertId;

        // 4. Insertar detalle por cada material
        for (const mat_id of materiales) {
            await query('INSERT INTO detalle_prestamo (prestamo_id, material_id) VALUES (?, ?)', [prestamoId, mat_id]);
        }

        // 5. Marcar materiales como ocupados
        await query(
            `UPDATE material SET disponible = 0 WHERE id IN (${materiales.map(() => '?').join(',')})`,
            materiales
        );

        res.json({ success: true, mensaje: 'Préstamo registrado correctamente', id: prestamoId });
    } catch (err) {
        console.error('❌ Error al crear préstamo:', err);
        res.status(500).json({ success: false, error: 'Error al crear préstamo: ' + err.message });
    }
});

// FINALIZAR préstamo (transacción: estado + fecha_entrega + liberar materiales)
app.post('/api/prestamo/:id/finalizar', async (req, res) => {
    const { id } = req.params;
    const { observaciones } = req.body;

    try {
        // Actualizar préstamo
        await query("UPDATE prestamo SET estado_general = 'Finalizado', fecha_entrega = CURDATE(), observaciones = ? WHERE id = ?",
            [observaciones || '', id]);

        // Actualizar detalle
        await query("UPDATE detalle_prestamo SET fecha_entrega_real = NOW() WHERE prestamo_id = ?", [id]);

        // Liberar materiales
        await query(`UPDATE material SET disponible = 1 WHERE id IN (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ?)`, [id]);

        res.json({ success: true, mensaje: 'Préstamo finalizado correctamente' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al finalizar préstamo' });
    }
});

// RENOVAR préstamo (agregar N días a fecha_limite)
app.put('/api/prestamo/:id/renovar', async (req, res) => {
    const { id } = req.params;
    const { dias } = req.body;

    if (!dias || dias < 1) {
        return res.status(400).json({ success: false, message: 'Debes indicar cuántos días renovar (mínimo 1)' });
    }

    try {
        await query(
            "UPDATE prestamo SET fecha_limite = DATE_ADD(fecha_limite, INTERVAL ? DAY), estado_general = 'Renovado' WHERE id = ?",
            [dias, id]
        );
        res.json({ success: true, mensaje: `Préstamo renovado (+${dias} días)` });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al renovar préstamo' });
    }
});

// CAMBIAR ESTADO de préstamo
app.put('/api/prestamo/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado_general } = req.body;

    try {
        await query('UPDATE prestamo SET estado_general = ? WHERE id = ?', [estado_general, id]);

        // Si se finaliza/cancela/devuelve, liberar materiales
        if (['Finalizado', 'Cancelado', 'Devuelto', 'Entregado', 'Denegado', 'Cerrado'].includes(estado_general)) {
            await query(`UPDATE material SET disponible = 1 WHERE id IN (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ?)`, [id]);
            if (estado_general === 'Finalizado' || estado_general === 'Entregado' || estado_general === 'Devuelto') {
                await query("UPDATE prestamo SET fecha_entrega = CURDATE() WHERE id = ? AND fecha_entrega IS NULL", [id]);
            }
        }
        // Si se activa/presta, marcar materiales como ocupados
        if (['Activo', 'Abierto'].includes(estado_general)) {
            await query(`UPDATE material SET disponible = 0 WHERE id IN (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ?)`, [id]);
        }

        res.json({ success: true, mensaje: `Estado cambiado a: ${estado_general}` });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al cambiar estado' });
    }
});

// EDITAR préstamo (observaciones, estado general, etc.)
app.put('/api/prestamo/:id', async (req, res) => {
    const { id } = req.params;
    const { estado_general, estado_devolucion, fecha_entrega_real, observaciones } = req.body;

    try {
        await query('UPDATE prestamo SET estado_general = ?, observaciones = ? WHERE id = ?',
            [estado_general, observaciones, id]);

        if (estado_devolucion) {
            const fechaEntrega = fecha_entrega_real || null;
            await query('UPDATE detalle_prestamo SET estado_devolucion = ?, fecha_entrega_real = ? WHERE prestamo_id = ?',
                [estado_devolucion, fechaEntrega, id]);
        }

        // Si estado finaliza, liberar materiales
        if (['Finalizado', 'Cancelado', 'Devuelto', 'Entregado', 'Cerrado'].includes(estado_general)) {
            await query(`UPDATE material SET disponible = 1 WHERE id IN (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ?)`, [id]);
        }

        res.json({ success: true, mensaje: 'Préstamo actualizado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al editar préstamo' });
    }
});

// ELIMINAR préstamo
app.delete('/api/prestamo/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Liberar materiales
        await query(`UPDATE material SET disponible = 1 WHERE id IN (SELECT material_id FROM detalle_prestamo WHERE prestamo_id = ?)`, [id]);
        // Eliminar detalles
        await query('DELETE FROM detalle_prestamo WHERE prestamo_id = ?', [id]);
        // Eliminar préstamo
        const result = await query('DELETE FROM prestamo WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
        res.json({ success: true, mensaje: 'Préstamo eliminado' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al eliminar préstamo' });
    }
});

// SANCIONAR usuario desde préstamo
app.post('/api/prestamo/:id/sancionar', async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
        const prestamo = await query('SELECT usuario_id FROM prestamo WHERE id = ?', [id]);
        if (prestamo.length === 0) return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });

        await query("UPDATE usuario SET estatus = 'Sancionado', motivo_sancion = ? WHERE id = ?",
            [motivo || 'Sancionado por incumplimiento de préstamo', prestamo[0].usuario_id]);
        res.json({ success: true, mensaje: 'Usuario sancionado desde préstamo' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al sancionar' });
    }
});

// ========================================================
// ============ CRUD DE DISCIPLINAS ============
// ========================================================

// LISTAR disciplinas (con entrenador)
app.get('/api/disciplina', async (req, res) => {
    try {
        const results = await query(`
            SELECT d.id, d.nombre, d.entrenador_id, 
                   IFNULL(CONCAT(u.nombre, ' ', u.apellidos), 'Sin asignar') AS entrenador_nombre
            FROM disciplina d
            LEFT JOIN usuario u ON d.entrenador_id = u.id
        `);
        res.json({ success: true, disciplinas: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar disciplinas' });
    }
});

// CREAR disciplina
app.post('/api/disciplina', async (req, res) => {
    const { nombre, entrenador_id } = req.body;
    if (!nombre) return res.status(400).json({ success: false, error: 'Nombre es obligatorio' });

    try {
        const result = await query('INSERT INTO disciplina (nombre, entrenador_id) VALUES (?, ?)',
            [nombre, entrenador_id || null]);
        res.json({ success: true, mensaje: 'Disciplina creada', id: result.insertId });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al crear disciplina: ' + err.message });
    }
});

// ELIMINAR disciplina
app.delete('/api/disciplina/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM disciplina WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Disciplina no encontrada' });
        res.json({ success: true, mensaje: 'Disciplina eliminada' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al eliminar disciplina' });
    }
});

// ========================================================
// ============ GESTIÓN DE ENTRENADORES ============
// ========================================================

// LISTAR entrenadores (usuarios con rol Docente)
app.get('/api/entrenador', async (req, res) => {
    try {
        const results = await query("SELECT id, nombre, apellidos, email, identificador FROM usuario WHERE rol = 'Docente'");
        res.json({ success: true, entrenadores: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar entrenadores' });
    }
});

// CANDIDATOS a entrenador (usuarios que NO son Docente ni Admin)
app.get('/api/entrenador/candidatos', async (req, res) => {
    try {
        const results = await query("SELECT id, nombre, apellidos, email, identificador, rol FROM usuario WHERE rol NOT IN ('Docente', 'Admin', 'Operador')");
        res.json({ success: true, candidatos: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al consultar candidatos' });
    }
});

// PROMOVER a entrenador
app.put('/api/entrenador/promover/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query("UPDATE usuario SET rol = 'Docente' WHERE id = ?", [id]);
        res.json({ success: true, mensaje: 'Usuario promovido a Entrenador' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al promover' });
    }
});

// REMOVER entrenador
app.put('/api/entrenador/remover/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Quitar de disciplinas asignadas
        await query('UPDATE disciplina SET entrenador_id = NULL WHERE entrenador_id = ?', [id]);
        await query("UPDATE usuario SET rol = 'Alumno' WHERE id = ?", [id]);
        res.json({ success: true, mensaje: 'Entrenador removido, ahora es Alumno' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al remover entrenador' });
    }
});

// ========================================================
// ============ PERFIL ============
// ========================================================

// Historial de préstamos del usuario
app.get('/api/perfil/:userId/prestamos', async (req, res) => {
    const { userId } = req.params;
    try {
        const results = await query(`
            SELECT p.id, p.fecha_solicitud, p.fecha_limite, p.estado_general,
                   GROUP_CONCAT(m.nombre SEPARATOR ', ') AS materiales
            FROM prestamo p
            LEFT JOIN detalle_prestamo dp ON dp.prestamo_id = p.id
            LEFT JOIN material m ON dp.material_id = m.id
            WHERE p.usuario_id = ?
            GROUP BY p.id
            ORDER BY p.id DESC LIMIT 10
        `, [userId]);
        res.json({ success: true, prestamos: results });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
});

// ESTADÍSTICAS generales (para dashboard admin)
app.get('/api/estadisticas', async (req, res) => {
    try {
        const users = await query("SELECT COUNT(*) AS total, SUM(CASE WHEN estatus='Activo' THEN 1 ELSE 0 END) AS activos FROM usuario");
        const mats = await query("SELECT COUNT(*) AS total, SUM(CASE WHEN disponible=1 THEN 1 ELSE 0 END) AS disponibles FROM material");
        const prests = await query(`
            SELECT COUNT(*) AS total,
                SUM(CASE WHEN estado_general IN ('Abierto','Activo','Renovado') THEN 1 ELSE 0 END) AS activos,
                SUM(CASE WHEN estado_general IN ('Abierto','Activo','Renovado') AND fecha_limite < NOW() THEN 1 ELSE 0 END) AS vencidos
            FROM prestamo
        `);
        res.json({
            success: true,
            usuarios: { total: Number(users[0].total) || 0, activos: Number(users[0].activos) || 0 },
            materiales: { total: Number(mats[0].total) || 0, disponibles: Number(mats[0].disponibles) || 0 },
            prestamos: { total: Number(prests[0].total) || 0, activos: Number(prests[0].activos) || 0, vencidos: Number(prests[0].vencidos) || 0 }
        });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
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
    console.log('   POST /api/usuario | GET /api/usuario | PUT /api/usuario/:id | DELETE /api/usuario/:id');
    console.log('   PUT  /api/usuario/:id/estatus | PUT /api/usuario/:id/sancionar');
    console.log('   POST /api/articulo | PUT /api/articulo/:id | DELETE /api/articulo/:id');
    console.log('   GET  /api/consultar/articulo | GET /api/articulo/disponibles | GET /api/totalArt');
    console.log('   GET  /api/prestamo | POST /api/prestamo | PUT /api/prestamo/:id | DELETE /api/prestamo/:id');
    console.log('   GET  /api/prestamo/stats | GET /api/prestamo/:id/detalle');
    console.log('   POST /api/prestamo/:id/finalizar | PUT /api/prestamo/:id/renovar | PUT /api/prestamo/:id/estado');
    console.log('   POST /api/prestamo/:id/sancionar');
    console.log('   GET  /api/disciplina | POST /api/disciplina | DELETE /api/disciplina/:id');
    console.log('   GET  /api/entrenador | GET /api/entrenador/candidatos');
    console.log('   PUT  /api/entrenador/promover/:id | PUT /api/entrenador/remover/:id');
    console.log('   GET  /api/perfil/:userId/prestamos | GET /api/estadisticas\n');
});
