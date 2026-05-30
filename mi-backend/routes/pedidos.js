// backend/routes/pedidos.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import db from '../db.js';

const router = express.Router();
const mesasPath = path.resolve('./mesas.json');

// ══════════════════════════════════════════════════════════
// 1. VALIDAR, REGISTRAR Y LANZAR UNA NUEVA COMANDA
// ══════════════════════════════════════════════════════════
router.post('/validarCodigoMesa', async (req, res) => {
    // Recibimos la bandera 'descuentoAplicado' desde el cuerpo de la petición
    const { codigoCliente, carritoItems, totalPrecio, idUsuario, descuentoAplicado } = req.body;

    try {
        const dataMesas = fs.readFileSync(mesasPath, 'utf-8');
        const mesas = JSON.parse(dataMesas);
        const mesaEncontrada = mesas.find(m => m.ocupada && m.codigo === codigoCliente.toUpperCase().trim());

        if (!mesaEncontrada) {
            return res.status(400).json({ success: false, mensaje: "Código inválido o mesa expirada." });
        }

        const usuarioFinalId = idUsuario || null; 

        // Insertamos la orden en MySQL con el precio final (descontado si aplica)
        const [resultado] = await db.query(
            'INSERT INTO pedidos (id_mesa, id_usuario, total, estatus) VALUES (?, ?, ?, "pendiente")',
            [mesaEncontrada.id, usuarioFinalId, totalPrecio]
        );
        const idPedidoFinal = resultado.insertId;

        // Metemos los productos al ticket modular por comanda
        await Promise.all(carritoItems.map(item =>
            db.query(
                'INSERT INTO pedido_productos (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?, ?)',
                [idPedidoFinal, item.id, item.nombre, item.cantidad, item.precio]
            )
        ));

        // 🔥 LOGICA CONTRA EL BUG: Si se usó el descuento y el usuario está logueado, lo deshabilitamos en su registro
        if (usuarioFinalId && descuentoAplicado) {
            await db.query(
                "UPDATE usuarios SET tiene_descuento = 0 WHERE id_usuario = ?",
                [usuarioFinalId]
            );
        }

        // Recalculamos el total acumulado de la mesa para el monitor de cobro (solicitudes_cobro)
        const [totalMesaRes] = await db.query(
            "SELECT SUM(total) as sumaTotal FROM pedidos WHERE id_mesa = ? AND estatus IN ('pendiente', 'en_cocina', 'servido')",
            [mesaEncontrada.id]
        );
        const totalReal = totalMesaRes[0].sumaTotal || 0;

        await db.query(
            "UPDATE solicitudes_cobro SET total = ? WHERE id_mesa = ? AND estatus = 'pendiente'",
            [totalReal, mesaEncontrada.id]
        );

        res.json({ success: true, idMesa: mesaEncontrada.id, idPedido: idPedidoFinal, mensaje: "Comanda enviada a cocina con éxito." });

    } catch (error) {
        console.error("Error al procesar comanda:", error);
        res.status(500).json({ success: false, mensaje: "Error interno en el servidor." });
    }
});

// ══════════════════════════════════════════════════════════
// 2. OBTENER EL TOTAL ACUMULADO PARA EL CLIENTE (LA CUENTA UNIFICADA)
// ══════════════════════════════════════════════════════════
router.get('/consultarCuenta/:idMesa', async (req, res) => {
    const { idMesa } = req.params;

    try {
        const [pedidos] = await db.query(
            `SELECT id_pedido, total FROM pedidos
             WHERE id_mesa = ? AND estatus IN ('pendiente', 'en_cocina', 'servido')`,
            [idMesa]
        );

        if (pedidos.length === 0) {
            return res.json({ success: true, ordenActiva: false, productos: [], total: 0 });
        }

        const idsPedidos = pedidos.map(p => p.id_pedido);
        const totalAcumulado = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0);

        const [productos] = await db.query(
            `SELECT id_producto, nombre_producto,
                    SUM(cantidad) as cantidad, precio_unitario
             FROM pedido_productos
             WHERE id_pedido IN (?)
             GROUP BY id_producto, nombre_producto, precio_unitario`,
            [idsPedidos]
        );

        const [solicitud] = await db.query(
            `SELECT id_solicitud FROM solicitudes_cobro
             WHERE id_mesa = ? AND estatus = 'pendiente'
             ORDER BY fecha_solicitud DESC LIMIT 1`,
            [idMesa]
        );

        res.json({
            success: true,
            ordenActiva: true,
            idPedido: pedidos[pedidos.length - 1].id_pedido,
            total: totalAcumulado,
            productos,
            tieneSolicitudCobro: solicitud.length > 0,
        });

    } catch (error) {
        console.error("Error al consultar cuenta:", error);
        res.status(500).json({ success: false, mensaje: "Error al obtener los datos de la cuenta." });
    }
});

// ══════════════════════════════════════════════════════════
// 3. SOLICITAR COBRO
// ══════════════════════════════════════════════════════════
router.post('/solicitarCobro', async (req, res) => {
    const { idMesa, metodoPago, total } = req.body;

    if (!idMesa || !metodoPago || !total) {
        return res.status(400).json({ success: false, mensaje: "Faltan datos para la solicitud." });
    }

    try {
        const [existente] = await db.query(
            "SELECT id_solicitud FROM solicitudes_cobro WHERE id_mesa = ? AND estatus = 'pendiente'",
            [idMesa]
        );

        if (existente.length > 0) {
            await db.query(
                "UPDATE solicitudes_cobro SET metodo_pago = ?, total = ?, fecha_solicitud = NOW() WHERE id_solicitud = ?",
                [metodoPago, total, existente[0].id_solicitud]
            );
        } else {
            await db.query(
                "INSERT INTO solicitudes_cobro (id_mesa, metodo_pago, total) VALUES (?, ?, ?)",
                [idMesa, metodoPago, total]
            );
        }

        res.json({ success: true, mensaje: "Solicitud de cobro registrada." });

    } catch (error) {
        console.error("Error al registrar solicitud de cobro:", error);
        res.status(500).json({ success: false, mensaje: "Error al registrar la solicitud." });
    }
});

// ══════════════════════════════════════════════════════════
// 4. ENVIAR PEDIDOS ACTIVOS AL MONITOR GENERAL
// ══════════════════════════════════════════════════════════
router.get('/obtenerPedidosActivos', async (req, res) => {
    try {
        const [pedidos] = await db.query(
            `SELECT id_pedido, id_mesa, total, estatus,
                    DATE_FORMAT(fecha_pedido, '%H:%i') as hora
             FROM pedidos
             WHERE estatus IN ('pendiente', 'en_cocina')
             ORDER BY fecha_pedido ASC`
        );

        let pedidosCompletos = [];
        if (pedidos.length > 0) {
            const [productos] = await db.query(
                `SELECT id_pedido, nombre_producto, cantidad
                 FROM pedido_productos
                 WHERE id_pedido IN (?)`,
                [pedidos.map(p => p.id_pedido)]
            );
            pedidosCompletos = pedidos.map(pedido => ({
                ...pedido,
                productos: productos.filter(p => p.id_pedido === pedido.id_pedido),
            }));
        }

        const [solicitudes] = await db.query(
            `SELECT id_solicitud, id_mesa, metodo_pago, total,
                    DATE_FORMAT(fecha_solicitud, '%H:%i') as hora
             FROM solicitudes_cobro
             WHERE estatus = 'pendiente'
             ORDER BY fecha_solicitud ASC`
        );

        res.json({ success: true, pedidos: pedidosCompletos, solicitudes });

    } catch (error) {
        console.error("Error al obtener pedidos activos:", error.message);
        res.status(500).json({ success: false, mensaje: "Error al consultar comandas." });
    }
});

// ══════════════════════════════════════════════════════════
// 5. ACTUALIZAR ESTATUS DE UN PEDIDO (solo flujo de cocina)
// ══════════════════════════════════════════════════════════
router.put('/actualizarEstatusPedido', async (req, res) => {
    const { idPedido, nuevoEstatus } = req.body;

    const estatusValidos = ['pendiente', 'en_cocina', 'servido', 'completado', 'cancelado'];
    if (!estatusValidos.includes(nuevoEstatus)) {
        return res.status(400).json({ success: false, mensaje: "Estatus inválido." });
    }

    try {
        await db.query(
            "UPDATE pedidos SET estatus = ? WHERE id_pedido = ?",
            [nuevoEstatus, idPedido]
        );
        res.json({ success: true, mensaje: `Pedido #${idPedido} actualizado a '${nuevoEstatus}'.` });
    } catch (error) {
        console.error("Error al cambiar estatus:", error);
        res.status(500).json({ success: false, mensaje: "No se pudo actualizar el estado." });
    }
});

// ══════════════════════════════════════════════════════════
// 6. COMPLETAR COBRO (caja confirma que cobró)
// ══════════════════════════════════════════════════════════
router.put('/completarCobro', async (req, res) => {
    const { idSolicitud, idMesa } = req.body;

    try {
        await db.query(
            "UPDATE solicitudes_cobro SET estatus = 'completada' WHERE id_solicitud = ?",
            [idSolicitud]
        );

        await db.query(
            `UPDATE pedidos SET estatus = 'completado'
             WHERE id_mesa = ? AND estatus IN ('pendiente', 'en_cocina', 'servido')`,
            [idMesa]
        );

        res.json({ success: true, mensaje: "Cobro completado y mesa liberada." });
    } catch (error) {
        console.error("Error al completar cobro:", error);
        res.status(500).json({ success: false, mensaje: "Error al completar el cobro." });
    }
});

export default router;