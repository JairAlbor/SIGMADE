const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajusta la ruta según donde tengas tu db.js

// ============================================
// INSERTAR USUARIO (POST)
// ============================================
router.post('/', async (req, res) => {
    try {
        // 1. Obtener los datos del body de la petición
        const { 
            identificador,
            nombres, 
            apellidos, 
            email, 
            password, 
            numero, 
            rol 
        } = req.body;

        // 2. Validar que los campos obligatorios existan
        if (!nombres || !apellidos || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Los campos nombres, apellidos, email y password son obligatorios' 
            });
        }

        // 3. Validar formato de email (opcional pero recomendado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'El formato del email no es válido' 
            });
        }

        // 4. Consulta SQL para insertar
        const sql = `INSERT INTO usuario 
                    (identificador, nombre, apellidos, email, password, telefono, rol) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // 5. Ejecutar la consulta
        const [result] = await db.query(sql, [
            identificador,
            nombres, 
            apellidos, 
            email, 
            password, // En texto plano por ahora
            numero || null, // Si viene vacío, guarda null
            rol || 'usuario', // Valor por defecto si no se envía
           
        ]);

        // 6. Enviar respuesta exitosa
        res.status(201).json({ 
            success: true, 
            message: 'Usuario registrado correctamente',
            data: {
                id: result.insertId,
                email: email,
                nombres: nombres,
                apellidos: apellidos
            }
        });

    } catch (error) {
        // 7. Manejo de errores específicos
        console.error('Error en POST /api/usuario:', error);
        
        // Error de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ingresado ya está registrado' 
            });
        }
        
        // Error de campo muy largo
        if (error.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ 
                success: false, 
                message: 'Uno de los campos excede la longitud permitida' 
            });
        }

        // Error general
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message // Solo en desarrollo
        });
    }
});

// ============================================
// OBTENER TODOS LOS USUARIOS (GET)
// ============================================
router.get('/', async (req, res) => {
    try {
        // Consultar todos los usuarios
        const [rows] = await db.query(`
            SELECT id, nombres, apellidos, email, numero, rol, estatus, frecuencia 
            FROM usuarios 
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en GET /api/usuarios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuarios' 
        });
    }
});

/*--------------------hacer login-----------------*/
router.post('/login', async (req, res) => {
    // 'credencial' es lo que el usuario escribe en el primer campo (email o ID)
    // 'password' es la contraseña en texto plano
    const { credencial, password } = req.body;

    try {
        // Buscamos al usuario que coincida en cualquiera de las dos columnas
        const [rows] = await db.query(
            'SELECT * FROM usuario WHERE email = ? OR identificador = ? LIMIT 1', 
            [credencial, credencial]
        );

        // Validamos si el usuario existe
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'El usuario no existe.' 
            });
        }

        const usuario = rows[0];

        // Verificación en texto plano
        // Usamos la columna 'password' (o como se llame en tu BD)
        if (password === usuario.password) {
            
            // Login exitoso: enviamos datos útiles al frontend
            res.json({
                success: true,
                message: 'Sesión iniciada correctamente',
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    identificador: usuario.identificador,
                    rol: usuario.rol
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'La contraseña es incorrecta.' 
            });
        }

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor.' 
        });
    }
});

// ============================================
// ACTUALIZAR USUARIO (PUT)
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, email, numero, rol, estatus, frecuencia } = req.body;

        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID inválido' 
            });
        }

        // Construir la consulta dinámicamente (solo actualiza campos que vienen)
        let sql = 'UPDATE usuarios SET ';
        const values = [];
        const updates = [];

        if (nombres) {
            updates.push('nombres = ?');
            values.push(nombres);
        }
        if (apellidos) {
            updates.push('apellidos = ?');
            values.push(apellidos);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (numero !== undefined) {
            updates.push('numero = ?');
            values.push(numero);
        }
        if (rol) {
            updates.push('rol = ?');
            values.push(rol);
        }
        if (estatus) {
            updates.push('estatus = ?');
            values.push(estatus);
        }
        if (frecuencia !== undefined) {
            updates.push('frecuencia = ?');
            values.push(frecuencia);
        }

        // Si no hay nada que actualizar
        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No hay campos para actualizar' 
            });
        }

        sql += updates.join(', ') + ' WHERE id = ?';
        values.push(id);

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente'
        });

    } catch (error) {
        console.error('Error en PUT /api/usuarios/:id', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ya está registrado' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar usuario' 
        });
    }
});

// ============================================
// ELIMINAR USUARIO (DELETE)
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID inválido' 
            });
        }

        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error('Error en DELETE /api/usuarios/:id', error);
        
        // Error por llave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el usuario porque tiene registros relacionados' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar usuario' 
        });
    }
});

module.exports = router;