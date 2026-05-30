// src/componentes/Pedidos/Pedidos.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Pedidos.css";

const Pedidos = () => {
    const [pedidosCocina, setPedidosCocina] = useState([]);
    const [solicitudesCobro, setSolicitudesCobro] = useState([]);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/obtenerPedidosActivos");
            if (res.data.success) {
                setPedidosCocina(res.data.pedidos);
                setSolicitudesCobro(res.data.solicitudes);
                setError(null);
            }
        } catch (err) {
            console.error("Error cargando monitor:", err);
            setError("No se pudo conectar con el servidor.");
        }
    };

    useEffect(() => {
        cargarDatos();
        const intervalo = setInterval(cargarDatos, 15000);
        return () => clearInterval(intervalo);
    }, []);

    // Cambia estatus del pedido (flujo de cocina únicamente)
    const cambiarEstatusPedido = async (idPedido, nuevoEstatus) => {
        try {
            const res = await axios.put("http://localhost:5000/api/actualizarEstatusPedido", {
                idPedido, nuevoEstatus
            });
            if (res.data.success) cargarDatos();
        } catch {
            alert("Error al cambiar el estado del pedido.");
        }
    };

    // Caja confirma que cobró — cierra la solicitud y libera la mesa
    const completarCobro = async (idSolicitud, idMesa) => {
        try {
            const res = await axios.put("http://localhost:5000/api/completarCobro", {
                idSolicitud, idMesa
            });
            if (res.data.success) cargarDatos();
        } catch {
            alert("Error al completar el cobro.");
        }
    };

    return (
        <div className="cocina-container">
            <h1 className="cocina-titulo">Panel de Control General (Michiato)</h1>
            {error && <div className="cocina-error">⚠️ {error}</div>}

            <div className="bloques-separados-layout">

                {/* ══════════════════════════════════════════
                    SECCIÓN 1: COMANDAS DE COCINA
                    ══════════════════════════════════════════ */}
                <div className="columna-monitor">
                    <h2 className="titulo-seccion-panel cocina-color-header">👨‍🍳 1. Comandas de Cocina</h2>

                    {pedidosCocina.length === 0 ? (
                        <p className="panel-vacio-texto">🎉 Al tiro, no hay platos pendientes de cocinar.</p>
                    ) : (
                        <div className="stack-tarjetas">
                            {pedidosCocina.map((pedido) => (
                                <div
                                    key={pedido.id_pedido}
                                    className={`tarjeta-panel ${pedido.estatus === 'en_cocina' ? 'borde-preparando' : 'borde-pendiente'}`}
                                >
                                    <div className="tarjeta-header">
                                        <span className="mesa-badge">Mesa #{pedido.id_mesa}</span>
                                        <span className="hora-badge">🕒 {pedido.hora}</span>
                                    </div>
                                    <div className="tarjeta-cuerpo">
                                        <h4 className="orden-id">
                                            Orden: #{pedido.id_pedido} ({pedido.estatus.toUpperCase()})
                                        </h4>
                                        <ul className="lista-items">
                                            {pedido.productos.map((prod, index) => (
                                                <li key={index} className="item-producto">
                                                    <span className="item-cantidad">{prod.cantidad}x</span>
                                                    <span className="item-nombre">{prod.nombre_producto}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="tarjeta-acciones">
                                        {pedido.estatus === 'pendiente' && (
                                            <button
                                                className="btn-panel btn-preparar"
                                                onClick={() => cambiarEstatusPedido(pedido.id_pedido, 'en_cocina')}
                                            >
                                                🔥 Empezar a Preparar
                                            </button>
                                        )}
                                        {pedido.estatus === 'en_cocina' && (
                                            <button
                                                className="btn-panel btn-completar"
                                                onClick={() => cambiarEstatusPedido(pedido.id_pedido, 'servido')}
                                            >
                                                ✅ Listo — Llevar a Mesa
                                            </button>
                                        )}
                                        <button
                                            className="btn-panel btn-cancelar"
                                            onClick={() => cambiarEstatusPedido(pedido.id_pedido, 'cancelado')}
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════════
                    SECCIÓN 2: SOLICITUDES DE COBRO
                    ══════════════════════════════════════════ */}
                <div className="columna-monitor border-izquierdo-separador">
                    <h2 className="titulo-seccion-panel mesero-color-header">
                        💰 2. Solicitudes de Pago ({solicitudesCobro.length})
                    </h2>

                    {solicitudesCobro.length === 0 ? (
                        <p className="panel-vacio-texto">☕ Ningún cliente ha solicitado la cuenta aún.</p>
                    ) : (
                        <div className="stack-tarjetas">
                            {solicitudesCobro.map((solicitud) => (
                                <div
                                    key={solicitud.id_solicitud}
                                    className="tarjeta-panel borde-cobro-alerta animacion-flash"
                                >
                                    <div className="tarjeta-header">
                                        <span className="mesa-badge badge-alerta-color">
                                            📍 COBRAR A: MESA #{solicitud.id_mesa}
                                        </span>
                                        <span className="hora-badge">🕒 {solicitud.hora}</span>
                                    </div>

                                    <div className="tarjeta-cuerpo">
                                        <div className="banner-atencion-mesero">
                                            ⚠️ <strong>
                                                MÉTODO: {solicitud.metodo_pago
                                                    ? solicitud.metodo_pago.toUpperCase()
                                                    : 'NO ESPECIFICADO'}
                                            </strong>
                                            <br />
                                            {solicitud.metodo_pago === 'efectivo' &&
                                                "🧾 Lleva el ticket impreso y cobra en efectivo."}
                                            {solicitud.metodo_pago === 'tarjeta' &&
                                                "💳 Lleva la terminal inalámbrica a la mesa."}
                                            {solicitud.metodo_pago === 'linea' &&
                                                "✅ El cliente ya pagó en línea. Confirmar y liberar mesa."}
                                        </div>

                                        <div className="total-pedido-box">
                                            <span className="total-label">TOTAL A COBRAR:</span>
                                            <span className="total-monto">${solicitud.total}.00 MXN</span>
                                        </div>
                                    </div>

                                    <div className="tarjeta-acciones">
                                        <button
                                            className="btn-panel btn-finalizar-pago"
                                            onClick={() => completarCobro(solicitud.id_solicitud, solicitud.id_mesa)}
                                        >
                                            ✅ Cobrado / Mesa Liberada
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Pedidos;