const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// GET /api/articulos - Obtener todos
router.get('/', (req, res) => {
    connection.query('SELECT * FROM articulos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/articulos/:id - Obtener uno
router.get('/:id', (req, res) => {
    connection.query('SELECT * FROM articulos WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(results[0]);
    });
});

// POST /api/articulos - Crear
router.post('/', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    connection.query(
        'INSERT INTO articulos (nombre, descripcion, precio) VALUES (?, ?, ?)',
        [nombre, descripcion, precio],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, ...req.body });
        }
    );
});

// PUT /api/articulos/:id - Actualizar
router.put('/:id', (req, res) => {
    connection.query(
        'UPDATE articulos SET ? WHERE id = ?',
        [req.body, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Actualizado correctamente' });
        }
    );
});

// DELETE /api/articulos/:id - Eliminar
router.delete('/:id', (req, res) => {
    connection.query('DELETE FROM articulos WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ mensaje: 'Eliminado correctamente' });
    });
});

module.exports = router;