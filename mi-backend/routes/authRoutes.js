import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = express.Router();


// POST /api/register - registrare

router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) return res.status(400).json({ success: false, mensaje: 'Todos los campos son obligatorios.' });
    if (password.length < 8) return res.status(400).json({ success: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' });

    try {
        const [existente] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
        if (existente.length > 0) return res.status(409).json({ success: false, mensaje: 'Ya existe una cuenta con ese correo.' });

        const hash = await bcrypt.hash(password, 10);
        // Al crear, MySQL le pondrá en automático el avatar por default y tiene_descuento en 1 (TRUE)
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre.trim(), email.trim().toLowerCase(), hash, 'cliente']
        );

        res.status(201).json({ success: true, mensaje: 'Cuenta creada con éxito.', idUsuario: resultado.insertId });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error interno al crear la cuenta.' });
    }
});


// POST /api/login  -iniciar secion

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, mensaje: 'Correo y contraseña son requeridos.' });

    try {
        // Traemos también el avatar y el descuento
        const [usuarios] = await db.query(
            'SELECT id_usuario, nombre, email, password, rol, avatar, tiene_descuento FROM usuarios WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (usuarios.length === 0) return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });

        const usuario = usuarios[0];
        const coincide = await bcrypt.compare(password, usuario.password);

        if (!coincide) return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });

        res.json({
            success: true,
            usuario: {
                id_usuario: usuario.id_usuario, 
                nombre: usuario.nombre,
                email:  usuario.email,
                rol:    usuario.rol,
                avatar: usuario.avatar,
                tiene_descuento: usuario.tiene_descuento
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
    }
});


// PUT /api/user/:id — Actualizar Perfil

router.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, avatar } = req.body;

    try {
        let query = "UPDATE usuarios SET nombre = ?, email = ?, avatar = ? WHERE id_usuario = ?";
        let params = [nombre, email, avatar, id];

        
        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, 10);
            query = "UPDATE usuarios SET nombre = ?, email = ?, avatar = ?, password = ? WHERE id_usuario = ?";
            params = [nombre, email, avatar, hash, id];
        }

        await db.query(query, params);

      
        const [updatedUser] = await db.query('SELECT id_usuario, nombre, email, rol, avatar, tiene_descuento FROM usuarios WHERE id_usuario = ?', [id]);
        
        res.json({ success: true, mensaje: 'Perfil actualizado.', usuario: updatedUser[0] });
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        res.status(500).json({ success: false, mensaje: 'Error al actualizar el perfil.' });
    }
});





// /api/historial/:idUsuario — Ver historial de compras

router.get('/historial/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;
    try {
        
        const [pedidos] = await db.query(
            "SELECT id_pedido, total, fecha_pedido FROM pedidos WHERE id_usuario = ? ORDER BY fecha_pedido DESC",
            [idUsuario]
        );

        if (pedidos.length === 0) return res.json({ success: true, historial: [] });

    
        const idsPedidos = pedidos.map(p => p.id_pedido);
        const [productos] = await db.query(
            "SELECT id_pedido, nombre_producto, cantidad, precio_unitario FROM pedido_productos WHERE id_pedido IN (?)",
            [idsPedidos]
        );

 
        const historial = pedidos.map(pedido => ({
            ...pedido,
            productos: productos.filter(p => p.id_pedido === pedido.id_pedido)
        }));

        res.json({ success: true, historial });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al traer el historial." });
    }
});




export default router;